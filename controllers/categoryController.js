const db = require('../config/db');

// 1. Lấy tất cả danh mục
exports.getAllCategories = (req, res) => {
    const sql = "SELECT * FROM Categories WHERE IsDeleted = 0";
    db.query(sql, (err, results) => {
        if(err) return res.status(500).json({ error: "Lỗi lấy danh mục" });
        res.json(results);
    });
};

// 2. Thêm danh mục mới
exports.createCategory = (req, res) => {
    const { name, description } = req.body;
    db.query("INSERT INTO Categories (CategoryName, Description) VALUES (?, ?)", [name, description], (err) => {
        if(err) return res.status(500).json({ error: "Lỗi thêm danh mục" });
        res.json({ message: "Thêm thành công!" });
    });
};

// 3. Cập nhật danh mục
exports.updateCategory = (req, res) => {
    const { name, description } = req.body;
    db.query("UPDATE Categories SET CategoryName=?, Description=? WHERE CategoryID=?", [name, description, req.params.id], (err) => {
        if(err) return res.status(500).json({ error: "Lỗi update" });
        res.json({ message: "Cập nhật thành công!" });
    });
};

// 4. Xóa danh mục
exports.deleteCategory = (req, res) => {
    const sql = "UPDATE Categories SET IsDeleted = 1 WHERE CategoryID = ?";
    
    db.query(sql, [req.params.id], (err) => {
        if(err) return res.status(500).json({ error: "Lỗi xóa danh mục" });
        res.json({ message: "Đã xóa danh mục!" });
    });
};