-- Migration: Thêm các trường cho chức năng đặt lại mật khẩu
-- Chạy file này trong MySQL để thêm các cột mới vào bảng Accounts

ALTER TABLE Accounts 
ADD COLUMN ResetPasswordToken VARCHAR(255) DEFAULT NULL,
ADD COLUMN ResetPasswordExpires DATETIME DEFAULT NULL;

-- Tạo index để tăng tốc độ tìm kiếm theo token
CREATE INDEX idx_reset_token ON Accounts(ResetPasswordToken);

