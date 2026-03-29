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
   - chọn `Mã riêng theo thiết bị` hoặc `Mã trial công khai`
   - nếu là `Mã riêng theo thiết bị`: nhập `Mã thiết bị`, `Label`, và có thể nhập `Số ngày hiệu lực` hoặc `Hết hạn`
   - nếu là `Mã trial công khai`: nhập `Số ngày trial`, có thể để trống `Label`
4. Bấm `Sinh mã kích hoạt`
5. Copy chuỗi vừa sinh và gửi cho người dùng

## Quy tắc thời hạn cho mã riêng theo thiết bị

- Nếu nhập `Số ngày hiệu lực`, webapp sẽ tự tính `Hết hạn` kể từ lúc sinh mã.
- Nếu để trống `Số ngày hiệu lực` và cũng không nhập `Hết hạn`, mã sẽ không có thời hạn.
- Nếu nhập cả `Số ngày hiệu lực` và `Hết hạn`, webapp ưu tiên `Số ngày hiệu lực`.

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
