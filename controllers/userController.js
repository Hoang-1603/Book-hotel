const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Lấy danh sách user
exports.getAllUsers = (req, res) => {
    const sql = "SELECT AccountID, Username, Email, RoleID, CreatedAt, IFNULL(IsDeleted, 0) AS IsDeleted FROM Accounts WHERE IsDeleted = 0 OR IsDeleted IS NULL";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Lỗi lấy danh sách user:', err);
            return res.status(500).json({ error: "Lỗi lấy dữ liệu: " + (err.sqlMessage || err.message) });
        }
        console.log('✅ getAllUsers - tổng số bản ghi trả về:', results.length);
        res.json(results);
    });
};

// 2. Tạo user mới
exports.createUser = (req, res) => {
    const { username, email, password, role } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if(err) return res.status(500).json({ error: "Lỗi mã hóa" });

        db.query("INSERT INTO Accounts (Username, Email, PasswordHash, RoleID) VALUES (?, ?, ?, ?)", 
        [username, email, hash, role], (err) => {
            if (err) return res.status(500).json({ error: "Lỗi thêm user" });
            res.json({ message: "Thêm thành công!" });
        });
    });
};

// 3. Cập nhật user
exports.updateUser = (req, res) => {
    const { email, role, password } = req.body;
    const id = req.params.id;

    if (password) {
        bcrypt.hash(password, 10, (err, hash) => {
            db.query("UPDATE Accounts SET Email=?, RoleID=?, PasswordHash=? WHERE AccountID=?", [email, role, hash, id], (err) => {
                if(err) return res.status(500).json({ error: "Lỗi update" });
                res.json({ message: "Cập nhật thành công!" });
            });
        });
    } else {
        db.query("UPDATE Accounts SET Email=?, RoleID=? WHERE AccountID=?", [email, role, id], (err) => {
            if(err) return res.status(500).json({ error: "Lỗi update" });
            res.json({ message: "Cập nhật thành công!" });
        });
    }
};

// 4. Xóa user
exports.deleteUser = (req, res) => {
    const sql = "UPDATE Accounts SET IsDeleted = 1 WHERE AccountID = ?";
    
    db.query(sql, [req.params.id], (err) => {
        if(err) return res.status(500).json({ error: "Lỗi xóa user" });
        res.json({ message: "Đã xóa tài khoản!" });
    });
};