# 📧 TÓM TẮT: CHỨC NĂNG SMTP - ĐĂNG KÝ & QUÊN MẬT KHẨU

## ✅ Đã hoàn thành

### **1. Backend:**
- ✅ Cài đặt `nodemailer` vào `package.json`
- ✅ Tạo service email (`services/emailService.js`)
- ✅ Cập nhật `authController.js`:
  - Gửi email chào mừng khi đăng ký
  - Chức năng quên mật khẩu (forgotPassword)
  - Chức năng đặt lại mật khẩu (resetPassword)
- ✅ Thêm routes: `/api/forgot-password` và `/api/reset-password`

### **2. Database:**
- ✅ Tạo migration SQL để thêm:
  - `ResetPasswordToken` (VARCHAR 255)
  - `ResetPasswordExpires` (DATETIME)

### **3. Frontend:**
- ✅ Trang quên mật khẩu (`forgot-password.html` + `forgot-password.js`)
- ✅ Trang đặt lại mật khẩu (`reset-password.html` + `reset-password.js`)
- ✅ Cập nhật `login.html` thêm link "Quên mật khẩu?"

---

## 🚀 Cách sử dụng

### **Bước 1: Cài đặt dependencies**

```bash
cd Book-hotel
npm install
```

### **Bước 2: Chạy Database Migration**

Chạy file SQL trong MySQL:
```sql
-- File: migrations/add-reset-password-fields.sql
ALTER TABLE Accounts 
ADD COLUMN ResetPasswordToken VARCHAR(255) DEFAULT NULL,
ADD COLUMN ResetPasswordExpires DATETIME DEFAULT NULL;

CREATE INDEX idx_reset_token ON Accounts(ResetPasswordToken);
```

### **Bước 3: Cấu hình SMTP trong `.env`**

Thêm vào file `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Hotel Booking

# Frontend URL (dùng trong email)
FRONTEND_URL=http://localhost:3000

# JWT Secret (nếu chưa có)
JWT_SECRET=your-super-secret-jwt-key
```

**📖 Xem hướng dẫn chi tiết:** `HUONG_DAN_CAU_HINH_SMTP.md`

### **Bước 4: Chạy server**

```bash
node server.js
```

---

## 🔄 Luồng hoạt động

### **1. Đăng ký tài khoản:**

1. User điền form đăng ký
2. Server tạo tài khoản
3. **Gửi email chào mừng** đến email đăng ký
4. User nhận email với thông tin chào mừng

### **2. Quên mật khẩu:**

1. User click "Quên mật khẩu?" ở trang login
2. Nhập email đăng ký
3. Server tạo reset token (ngẫu nhiên 64 ký tự)
4. Lưu token hash vào database (hết hạn sau 1 giờ)
5. **Gửi email** với link reset password
6. User nhận email, click link

### **3. Đặt lại mật khẩu:**

1. User click link trong email (chứa token)
2. Chuyển đến trang `reset-password.html?token=xxx`
3. User nhập mật khẩu mới
4. Server xác thực token và cập nhật mật khẩu
5. Token bị xóa sau khi sử dụng

---

## 🔒 Bảo mật

- ✅ Token reset password được **hash** trước khi lưu database
- ✅ Token chỉ sử dụng **1 lần**
- ✅ Token tự động **hết hạn sau 1 giờ**
- ✅ Không tiết lộ email có tồn tại hay không (luôn trả về thành công)

---

## 📁 Cấu trúc files mới

```
Book-hotel/
├── services/
│   └── emailService.js          # Service gửi email
├── migrations/
│   └── add-reset-password-fields.sql  # SQL migration
├── controllers/
│   └── authController.js        # Đã cập nhật: register, forgotPassword, resetPassword
├── routes/
│   └── authRoutes.js            # Đã thêm: /forgot-password, /reset-password
├── public/auth/
│   ├── forgot-password.html     # Trang quên mật khẩu
│   ├── forgot-password.js       # Logic quên mật khẩu
│   ├── reset-password.html      # Trang đặt lại mật khẩu
│   ├── reset-password.js        # Logic đặt lại mật khẩu
│   └── login.html               # Đã cập nhật: thêm link quên mật khẩu
└── package.json                 # Đã thêm: nodemailer
```

---

## 🌐 API Endpoints mới

### **POST /api/forgot-password**
Gửi email đặt lại mật khẩu

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."
}
```

### **POST /api/reset-password**
Đặt lại mật khẩu với token

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới."
}
```

---

## ⚠️ Lưu ý quan trọng

1. **Phải cấu hình SMTP** trước khi sử dụng
2. **Phải chạy migration SQL** trước khi dùng chức năng quên mật khẩu
3. Với **Gmail**, cần tạo **App Password** (không dùng mật khẩu thường)
4. File `.env` không được commit lên Git (đã có trong `.gitignore`)

---

## 📚 Tài liệu liên quan

- `HUONG_DAN_CAU_HINH_SMTP.md` - Hướng dẫn cấu hình SMTP chi tiết
- `HUONG_DAN_CHAY.md` - Hướng dẫn chạy dự án
- `HUONG_DAN_CHAY_FE.md` - Hướng dẫn chạy frontend

---

**Chúc bạn sử dụng thành công! 🎉**

