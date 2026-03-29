(function () {
  const config = window.ACTIVATION_TOOL_CONFIG;
  const elements = {
    activationCode: document.getElementById('activationCode'),
    copyButton: document.getElementById('copyButton'),
    effectiveDays: document.getElementById('effectiveDays'),
    effectiveDaysHint: document.getElementById('effectiveDaysHint'),
    expiresAt: document.getElementById('expiresAt'),
    generateButton: document.getElementById('generateButton'),
    generateStatus: document.getElementById('generateStatus'),
    installationId: document.getElementById('installationId'),
    label: document.getElementById('label'),
    mode: document.getElementById('mode'),
    modeFieldHint: document.getElementById('modeFieldHint'),
    modeHint: document.getElementById('modeHint'),
    passphrase: document.getElementById('passphrase'),
    payloadView: document.getElementById('payloadView'),
    resultNote: document.getElementById('resultNote'),
    trialDays: document.getElementById('trialDays'),
    trialDaysHint: document.getElementById('trialDaysHint'),
    unlockButton: document.getElementById('unlockButton'),
    unlockStatus: document.getElementById('unlockStatus'),
    installationIdHint: document.getElementById('installationIdHint'),
    expiresHint: document.getElementById('expiresHint'),
    labelHint: document.getElementById('labelHint'),
  };

  let privateKeyBase64Url = null;

  function setStatus(target, tone, message) {
    target.className = `status ${tone}`;
    target.textContent = message;
  }

  function toBase64Url(bytes) {
    return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  function fromBase64Url(value) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  function addDaysToIsoDate(issuedAtIso, days) {
    const expiresAt = new Date(issuedAtIso);
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt.toISOString();
  }

  function readPositiveInteger(value, fieldLabel) {
    if (!value) {
      return null;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`${fieldLabel} phải là số nguyên dương.`);
    }

    return parsed;
  }

  function buildPayload() {
    const installationId = elements.installationId.value.trim();
    const activationLabel = elements.label.value.trim() || null;
    const expiresAtInput = elements.expiresAt.value.trim() || null;
    const mode = elements.mode.value;
    const trialDays = readPositiveInteger(elements.trialDays.value || '30', 'Số ngày trial');
    const effectiveDays = readPositiveInteger(
      elements.effectiveDays.value.trim(),
      'Số ngày hiệu lực',
    );

    if (mode === 'device_code' && !installationId) {
      throw new Error('Nhập mã thiết bị.');
    }

    if (mode === 'device_code' && expiresAtInput) {
      const expiresAtTime = new Date(expiresAtInput).getTime();

      if (Number.isNaN(expiresAtTime)) {
        throw new Error('Hết hạn chưa đúng định dạng thời gian.');
      }
    }

    const issuedAt = new Date().toISOString();
    const expiresAt =
      mode === 'public_trial'
        ? null
        : effectiveDays
          ? addDaysToIsoDate(issuedAt, effectiveDays)
          : expiresAtInput;

    return {
      version: 1,
      activationMode: mode,
      installationId: mode === 'public_trial' ? null : installationId,
      activationLabel:
        activationLabel || (mode === 'public_trial' ? `Mã dùng thử công khai ${trialDays} ngày` : null),
      expiresAt,
      trialDurationDays: mode === 'public_trial' ? trialDays : null,
      issuedAt,
    };
  }

  function syncModeUi() {
    const mode = elements.mode.value;
    const isPublicTrial = mode === 'public_trial';

    elements.installationId.disabled = isPublicTrial;
    elements.expiresAt.disabled = isPublicTrial;
    elements.effectiveDays.disabled = isPublicTrial;
    elements.trialDays.disabled = !isPublicTrial;

    if (isPublicTrial) {
      elements.modeHint.textContent =
        'Mã trial công khai cho người dùng vào app ngay. Mỗi thiết bị chỉ dùng trial một lần.';
      elements.modeFieldHint.textContent =
        'Dùng cho mã dùng thử hiển thị công khai trên màn kích hoạt.';
      elements.installationIdHint.textContent =
        'Không cần nhập với mã trial công khai.';
      elements.trialDaysHint.textContent =
        'Nhập số ngày cho thời gian dùng thử trên mỗi thiết bị.';
      elements.effectiveDaysHint.textContent =
        'Không áp dụng ở chế độ mã trial công khai.';
      elements.expiresHint.textContent =
        'Không dùng ở chế độ này vì trial sẽ tự tính hạn theo số ngày.';
      elements.labelHint.textContent =
        'Có thể để trống, webapp sẽ tự tạo nhãn trial mặc định.';
      elements.resultNote.textContent =
        'Mã này là trial công khai. Thiết bị dùng trial một lần, hết hạn sẽ phải dùng mã kích hoạt chính thức.';
    } else {
      elements.modeHint.textContent =
        'Mã riêng theo thiết bị chỉ dùng cho đúng một thiết bị có mã DBS-...';
      elements.modeFieldHint.textContent =
        'Dùng khi cấp mã chính thức theo mã thiết bị.';
      elements.installationIdHint.textContent =
        'Bắt buộc với mã riêng theo thiết bị.';
      elements.trialDaysHint.textContent =
        'Không áp dụng ở chế độ mã riêng theo thiết bị.';
      elements.effectiveDaysHint.textContent =
        'Nếu nhập, webapp sẽ tự tính hạn theo số ngày kể từ lúc sinh mã. Để trống nếu muốn mã không thời hạn.';
      elements.expiresHint.textContent =
        'Có thể nhập ngày hết hạn cụ thể. Nếu đồng thời nhập số ngày hiệu lực, webapp sẽ ưu tiên số ngày hiệu lực.';
      elements.labelHint.textContent =
        'Dùng để ghi nhớ mã này cấp cho ai hoặc mục đích gì.';
      elements.resultNote.textContent =
        'Mã này chỉ hợp lệ với đúng mã thiết bị đã nhập. Nếu thay keypair, tất cả mã cũ sẽ mất hiệu lực.';
    }
  }

  function unlockKey() {
    const passphrase = elements.passphrase.value;

    if (!config || !config.encryptedPrivateKey) {
      setStatus(
        elements.unlockStatus,
        'error',
        'Thiếu file activation-tool-config.js hoặc file cấu hình chưa được tạo.',
      );
      return;
    }

    if (!passphrase) {
      setStatus(elements.unlockStatus, 'error', 'Nhập passphrase trước khi mở khóa.');
      return;
    }

    const decrypted = CryptoJS.AES.decrypt(
      config.encryptedPrivateKey,
      passphrase,
    ).toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      privateKeyBase64Url = null;
      setStatus(elements.unlockStatus, 'error', 'Passphrase chưa đúng.');
      return;
    }

    privateKeyBase64Url = decrypted;
    setStatus(elements.unlockStatus, 'ok', 'Đã mở khóa công cụ sinh mã.');
  }

  function generateCode() {
    try {
      if (!privateKeyBase64Url) {
        throw new Error('Mở khóa công cụ trước khi sinh mã.');
      }

      const payload = buildPayload();
      const encodedPayload = toBase64Url(
        new TextEncoder().encode(JSON.stringify(payload)),
      );
      const signature = nacl.sign.detached(
        new TextEncoder().encode(encodedPayload),
        fromBase64Url(privateKeyBase64Url),
      );
      const receipt = `${encodedPayload}.${toBase64Url(signature)}`;

      elements.activationCode.value = receipt;
      elements.payloadView.value = JSON.stringify(payload, null, 2);
      setStatus(elements.generateStatus, 'ok', 'Đã sinh mã kích hoạt.');
    } catch (error) {
      setStatus(
        elements.generateStatus,
        'error',
        error instanceof Error ? error.message : 'Không sinh được mã kích hoạt.',
      );
    }
  }

  async function copyCode() {
    if (!elements.activationCode.value) {
      setStatus(elements.generateStatus, 'warn', 'Chưa có mã để copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(elements.activationCode.value);
      setStatus(elements.generateStatus, 'ok', 'Đã copy mã kích hoạt.');
    } catch {
      setStatus(elements.generateStatus, 'error', 'Không copy được mã.');
    }
  }

  elements.unlockButton.addEventListener('click', unlockKey);
  elements.generateButton.addEventListener('click', generateCode);
  elements.copyButton.addEventListener('click', copyCode);
  elements.mode.addEventListener('change', syncModeUi);
  syncModeUi();
})();
