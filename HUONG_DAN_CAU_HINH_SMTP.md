# 📧 HƯỚNG DẪN CẤU HÌNH SMTP (Gửi Email)

## 📋 Yêu cầu

Chức năng gửi email yêu cầu cấu hình SMTP server. Dự án sử dụng **nodemailer** để gửi email.

---

## 🔧 Cấu hình SMTP trong file `.env`

Thêm các dòng sau vào file `.env` của bạn:

```env
# ===== CẤU HÌNH SMTP (Gửi Email) =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Hotel Booking

# URL Frontend (dùng trong email reset password)
FRONTEND_URL=http://localhost:3000

# JWT Secret (nếu chưa có)
JWT_SECRET=your-super-secret-jwt-key-here
```

---

## 📮 Cấu hình với Gmail (Khuyên dùng)

### **Bước 1: Tạo App Password**

1. Truy cập: https://myaccount.google.com/security
2. Bật **Xác minh 2 bước** (nếu chưa bật)
3. Vào phần **Mật khẩu ứng dụng** (App Passwords)
4. Chọn ứng dụng: **Mail**
5. Chọn thiết bị: **Khác (Tên tùy chỉnh)**
6. Nhập tên: **Hotel Booking**
7. Click **Tạo**
8. **Copy mật khẩu 16 ký tự** (không có khoảng trắng)

### **Bước 2: Cấu hình trong `.env`**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Dán App Password ở đây (có thể bỏ khoảng trắng)
SMTP_FROM_NAME=Hotel Booking
```

---

## 📮 Cấu hình với các email khác

### **Outlook/Hotmail:**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### **Yahoo Mail:**

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### **Email Server riêng:**

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587  # hoặc 465 cho SSL
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false  # true nếu dùng port 465
```

---

## 🧪 Kiểm tra cấu hình SMTP

Sau khi cấu hình, khởi động lại server:

```bash
node server.js
```

Nếu cấu hình đúng, bạn sẽ thấy thông báo:
```
✅ SMTP server đã sẵn sàng
```

---

## 📝 Các chức năng email

### **1. Email chào mừng (Khi đăng ký)**

- **Khi nào gửi:** Khi người dùng đăng ký tài khoản mới
- **Nội dung:** Chào mừng và hướng dẫn sử dụng

### **2. Email đặt lại mật khẩu (Quên mật khẩu)**

- **Khi nào gửi:** Khi người dùng yêu cầu đặt lại mật khẩu
- **Nội dung:** Link đặt lại mật khẩu (hết hạn sau 1 giờ)
- **Bảo mật:** 
  - Token được hash trước khi lưu vào database
  - Token chỉ sử dụng được 1 lần
  - Token tự động hết hạn sau 1 giờ

---

## 🗄️ Migration Database

Trước khi sử dụng chức năng quên mật khẩu, bạn cần chạy migration để thêm các cột mới:

1. Mở MySQL (Workbench, phpMyAdmin, hoặc command line)
2. Chọn database `book_room`
3. Chạy file: `migrations/add-reset-password-fields.sql`

Hoặc chạy trực tiếp:

```sql
ALTER TABLE Accounts 
ADD COLUMN ResetPasswordToken VARCHAR(255) DEFAULT NULL,
ADD COLUMN ResetPasswordExpires DATETIME DEFAULT NULL;

CREATE INDEX idx_reset_token ON Accounts(ResetPasswordToken);
```

---

## ⚠️ Xử lý lỗi thường gặp

### **Lỗi: "Invalid login" hoặc "Authentication failed"**

- **Nguyên nhân:** 
  - Gmail: Chưa tạo App Password hoặc nhập sai
  - Email khác: Mật khẩu không đúng
- **Giải pháp:**
  - Kiểm tra lại `SMTP_USER` và `SMTP_PASS` trong `.env`
  - Với Gmail, đảm bảo đã bật Xác minh 2 bước và tạo App Password

---

### **Lỗi: "Connection timeout"**

- **Nguyên nhân:** Firewall hoặc mạng chặn port 587
- **Giải pháp:**
  - Thử dùng port 465 với `SMTP_SECURE=true`
  - Kiểm tra firewall/cài đặt mạng

---

### **Lỗi: "Email không gửi được nhưng không có lỗi"**

- **Nguyên nhân:** Có thể email vào thư mục Spam
- **Giải pháp:**
  - Kiểm tra thư mục Spam
  - Đảm bảo `SMTP_FROM_NAME` là tên hợp lệ

---

## 🔒 Bảo mật

1. **KHÔNG commit file `.env` lên Git**
   - File `.env` đã được thêm vào `.gitignore`
   - Mỗi môi trường cần có `.env` riêng

2. **Sử dụng App Password thay vì mật khẩu chính**
   - Đặc biệt với Gmail
   - Dễ dàng thu hồi nếu bị lộ

3. **Token reset password được hash**
   - Không lưu token gốc vào database
   - Mỗi token chỉ dùng 1 lần

---

## 📚 Tài liệu tham khảo

- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SMTP Settings for Popular Email Providers](https://www.arclab.com/en/kb/email/list-of-smtp-and-pop3-servers-mailserver-list.html)

