const db = require('../config/db');

exports.createReview = (req, res) => {
    const { roomId, bookingId, rating, comment } = req.body; 
    const userId = req.user.id;
    // ... Logic kiểm tra đã checkout và đã review chưa (giữ nguyên logic cũ của bạn) ...
    const sqlCheck = `SELECT * FROM Bookings WHERE BookingID = ? AND AccountID = ? AND Status = 'CheckedOut'`;
    db.query(sqlCheck, [bookingId, userId], (err, bookings) => {
        if (err || bookings.length === 0) return res.status(403).json({ error: "Đơn hàng không hợp lệ!" });
        
        db.query(`SELECT * FROM Reviews WHERE BookingID = ?`, [bookingId], (err, reviews) => {
            if (reviews.length > 0) return res.status(400).json({ error: "Đã đánh giá rồi!" });
            
            db.query("INSERT INTO Reviews (RoomID, AccountID, BookingID, Rating, Comment) VALUES (?, ?, ?, ?, ?)", 
            [roomId, userId, bookingId, rating, comment], (err) => {
                if (err) return res.status(500).json({ error: "Lỗi lưu đánh giá" });
                res.json({ message: "Đánh giá thành công!" });
            });
        });
    });
};

exports.getRoomReviews = (req, res) => {
    const sql = `SELECT R.*, A.Username FROM Reviews R JOIN Accounts A ON R.AccountID = A.AccountID WHERE R.RoomID = ? ORDER BY R.CreatedAt DESC`;
    db.query(sql, [req.params.roomId], (err, results) => {
        if (err) return res.status(500).json({ error: "Lỗi Server" });
        res.json(results);
    });
};