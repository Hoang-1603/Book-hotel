const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM Accounts WHERE Username = ?", [username], (err, results) => {
        if (err) return res.status(500).json({ error: "Lỗi Server" });
        if (results.length === 0) return res.status(401).json({ error: "Sai tên đăng nhập!" });

        const user = results[0];
        bcrypt.compare(password, user.PasswordHash, (err, isMatch) => {
            if (isMatch) {
                const token = jwt.sign({ id: user.AccountID, role: user.RoleID }, process.env.JWT_SECRET, { expiresIn: '24h' });
                res.json({token, role: user.RoleID, username: user.Username });
            } else res.status(401).json({ error: "Sai mật khẩu!" });
        });
    });
};

exports.register = (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Thiếu thông tin!" });

    db.query("SELECT * FROM Accounts WHERE Username = ? OR Email = ?", [username, email], (err, results) => {
        if (results.length > 0) return res.status(409).json({ error: "Tài khoản đã tồn tại!" });

        bcrypt.hash(password, 10, (err, hash) => {
            db.query("INSERT INTO Accounts (Username, Email, PasswordHash, RoleID) VALUES (?, ?, ?, 2)", 
            [username, email, hash], (err) => {
                if(err) return res.status(500).json({ error: "Lỗi DB" });
                res.status(201).json({ message: "Đăng ký thành công!" });
            });
        });
    });
};