# Activation webapp

Webapp tĩnh để sinh activation code trên trình duyệt.

## Cách chuẩn bị

1. Tạo file config mã hóa bằng passphrase:

```bash
cd /Users/Huyle/Projects/dia-ban-so-app
node ./scripts/build-activation-webapp-config.mjs --passphrase "mot-passphrase-rat-manh"
```

2. Script sẽ ghi đè file:

```text
docs/activation-webapp/activation-tool-config.js
```

3. Host nguyên thư mục `docs/activation-webapp` lên bất kỳ static host nào.

## Cách dùng

1. Mở trang `index.html`
2. Nhập passphrase để mở khóa công cụ
3. Nhập:
   - `Mã thiết bị`
   - `Label`
   - `Hết hạn` nếu cần
4. Bấm `Sinh mã kích hoạt`
5. Copy chuỗi vừa sinh và gửi cho người dùng

## Lưu ý bảo mật

- Không host file config nếu passphrase yếu.
- Không commit passphrase vào repo.
- Không để lộ file keypair gốc:

```text
/Users/Huyle/.dia-ban-so-app/activation/activation-keypair.json
```

- Nếu nghi ngờ lộ private key hoặc passphrase, phải:
  1. tạo keypair mới
  2. cập nhật public key trong app
  3. build lại app
  4. tạo lại config webapp
