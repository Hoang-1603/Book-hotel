const db = require('../config/db');

// Khách đặt phòng
exports.createBooking = (req, res) => {
    const { roomId, checkIn, checkOut } = req.body; 
    const userId = req.user.id;
    if (!roomId || !checkIn || !checkOut) return res.status(400).json({ error: "Thiếu thông tin!" });

    db.query(`INSERT INTO Bookings (AccountID, RoomID, Status, CheckInDate, CheckOutDate) VALUES (?, ?, 'Pending', ?, ?)`, 
    [userId, roomId, checkIn, checkOut], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Đặt phòng thành công!" });
    });
};

// Khách xem lịch sử
exports.getMyBookings = (req, res) => {
    const sql = `
        SELECT B.*, R.RoomName, R.Price, R.ImageURL, Rv.ReviewID AS IsReviewed
        FROM Bookings B JOIN Rooms R ON B.RoomID = R.RoomID 
        LEFT JOIN Reviews Rv ON B.BookingID = Rv.BookingID
        WHERE B.AccountID = ? ORDER BY B.BookingDate DESC
    `;
    db.query(sql, [req.user.id], (err, result) => {
        if(err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

// Admin lấy danh sách
exports.getAllBookings = (req, res) => {
    const sql = `
        SELECT B.BookingID, B.CheckInDate, B.CheckOutDate, B.Status, B.BookingDate,
               A.Username, A.Email, R.RoomName, R.Price
        FROM Bookings B
        JOIN Accounts A ON B.AccountID = A.AccountID
        JOIN Rooms R ON B.RoomID = R.RoomID
        ORDER BY B.BookingDate DESC
    `;
    db.query(sql, (err, results) => {
        if(err) return res.status(500).json({ error: "Lỗi lấy đơn hàng" });
        res.json(results);
    });
};

// Admin cập nhật trạng thái
exports.updateBookingStatus = (req, res) => {
    db.query("UPDATE Bookings SET Status = ? WHERE BookingID = ?", [req.body.status, req.params.id], (err) => {
        if(err) return res.status(500).json({ error: "Lỗi cập nhật" });
        res.json({ message: "Cập nhật thành công!" });
    });
};