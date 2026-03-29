(function () {
  const config = window.ACTIVATION_TOOL_CONFIG;
  const elements = {
    activationCode: document.getElementById('activationCode'),
    copyButton: document.getElementById('copyButton'),
    expiresAt: document.getElementById('expiresAt'),
    generateButton: document.getElementById('generateButton'),
    generateStatus: document.getElementById('generateStatus'),
    installationId: document.getElementById('installationId'),
    label: document.getElementById('label'),
    passphrase: document.getElementById('passphrase'),
    payloadView: document.getElementById('payloadView'),
    unlockButton: document.getElementById('unlockButton'),
    unlockStatus: document.getElementById('unlockStatus'),
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

  function buildPayload() {
    const installationId = elements.installationId.value.trim();
    const activationLabel = elements.label.value.trim() || null;
    const expiresAt = elements.expiresAt.value.trim() || null;

    if (!installationId) {
      throw new Error('Nhập mã thiết bị.');
    }

    return {
      version: 1,
      installationId,
      activationLabel,
      expiresAt,
      issuedAt: new Date().toISOString(),
    };
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
})();
