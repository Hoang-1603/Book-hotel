// create_admin.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Đọc cấu hình từ file .env

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Thông tin tài khoản muốn tạo
const username = "admin";
const passwordRaw = "123456"; // Mật khẩu gốc
const email = "admin@hotel.com";

// Mã hóa mật khẩu
bcrypt.hash(passwordRaw, 10, (err, hash) => {
    if (err) throw err;

    // Lưu vào database (RoleID = 1 là Admin)
    const sql = "INSERT INTO Accounts (Username, Email, PasswordHash, RoleID) VALUES (?, ?, ?, 1)";
    
    connection.query(sql, [username, email, hash], (err, result) => {
        if (err) {
            console.log("❌ Lỗi tạo user: " + err.message);
        } else {
            console.log("✅ Đã tạo thành công Admin!");
            console.log("👉 User: " + username);
            console.log("👉 Pass: " + passwordRaw);
        }
        connection.end();
    });
});