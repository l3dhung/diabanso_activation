# Deploy nhanh len GitHub Pages

## Thu muc can dua len host

Su dung nguyen thu muc:

```text
docs/activation-webapp
```

Thu muc nay da co san:

- `index.html`
- `activation-tool.js`
- `activation-tool-config.js`
- `.nojekyll`

## Cach 1: Tao repo rieng cho webapp

1. Tao repo moi tren GitHub, vi du:
   - `diabanso-activation-tool`
2. Copy toan bo noi dung thu muc `docs/activation-webapp` vao root repo do
3. Push len branch `main`
4. Vao:
   - `Settings -> Pages`
5. Chon:
   - `Deploy from a branch`
   - `main`
   - `/ (root)`
6. Sau khi Pages xong, mo URL:

```text
https://<username>.github.io/diabanso-activation-tool/
```

## Cach 2: Dung chung repo hien co

Neu dua vao repo hien co, dat toan bo noi dung thu muc `docs/activation-webapp` vao mot thu muc branch Pages hoac root Pages cua repo public.

URL thuong se la:

```text
https://<username>.github.io/<repo-name>/
```

## Test sau khi deploy

1. Mo webapp
2. Nhap passphrase:

```text
Khanhchi2101@@@dbs
```

3. Nhap:
   - `Mã thiết bị`
   - `Label`
4. Bam `Sinh mã kích hoạt`
5. Copy chuoi vua tao va dan vao app

## Luu y

- Neu doi passphrase hoac keypair, phai tao lai `activation-tool-config.js`
- Khong dua file keypair goc len GitHub:

```text
/Users/Huyle/.dia-ban-so-app/activation/activation-keypair.json
```
