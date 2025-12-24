const db = require('../config/db');

// --- PUBLIC: TÌM KIẾM ---
exports.searchRooms = (req, res) => {
    const { location, checkIn, checkOut, categoryId } = req.query;
    const defaultCheckIn = new Date().toISOString().slice(0, 10);
    const defaultCheckOut = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const checkInDate = checkIn || defaultCheckIn;
    const checkOutDate = checkOut || defaultCheckOut;

    let sql = `
        SELECT R.*, C.CategoryName,
               COUNT(Rv.ReviewID) as ReviewCount, IFNULL(AVG(Rv.Rating), 0) as AvgRating
        FROM Rooms R
        LEFT JOIN Categories C ON R.CategoryID = C.CategoryID
        LEFT JOIN Reviews Rv ON R.RoomID = Rv.RoomID
        WHERE R.Status = 'available'
        AND R.RoomID NOT IN (
            SELECT B.RoomID FROM Bookings B
            WHERE B.Status IN ('Confirmed', 'CheckedIn') AND 
            ((B.CheckInDate <= ? AND B.CheckOutDate >= ?) OR (B.CheckInDate >= ? AND B.CheckInDate < ?))
        )
    `;
    const params = [checkOutDate, checkInDate, checkInDate, checkOutDate];
    if (location) { 
        sql += " AND R.Address LIKE ?"; 
        params.push(`%${location}%`); 
    }
    if (categoryId) {
        sql += " AND R.CategoryID = ?";
        params.push(categoryId);
    }
    sql += " GROUP BY R.RoomID";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// --- ADMIN: CRUD ---
exports.getAllRoomsAdmin = (req, res) => {
    const sql = `
        SELECT Rooms.*, Categories.CategoryName 
        FROM Rooms 
        LEFT JOIN Categories ON Rooms.CategoryID = Categories.CategoryID
    `;
    db.query(sql, (err, results) => {
        if(err) return res.status(500).json({ error: "Lỗi lấy phòng" });
        res.json(results);
    });
};

exports.createRoom = (req, res) => {
    const { name, category_id, price, status, description, image, address } = req.body;
    db.query(`INSERT INTO Rooms (RoomName, CategoryID, Price, Status, Description, ImageURL, Address) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [name, category_id, price, status, description, image, address], (err) => {
        if(err) return res.status(500).json({ error: "Lỗi thêm phòng" });
        res.json({ message: "Thêm thành công!" });
    });
};

exports.updateRoom = (req, res) => {
    const { name, category_id, price, status, description, image, address } = req.body;
    db.query("UPDATE Rooms SET RoomName=?, CategoryID=?, Price=?, Status=?, Description=?, ImageURL=?, Address=? WHERE RoomID=?", 
    [name, category_id, price, status, description, image, address, req.params.id], (err) => {
        if(err) return res.status(500).json({ error: "Lỗi update" });
        res.json({ message: "Cập nhật thành công!" });
    });
};

exports.deleteRoom = (req, res) => {
    // Xóa cứng vì bảng Rooms gốc không có cột IsDeleted
    const sql = "DELETE FROM Rooms WHERE RoomID = ?";
    db.query(sql, [req.params.id], (err) => {
        if(err) return res.status(500).json({ error: "Lỗi xóa phòng" });
        res.json({ message: "Đã xóa phòng thành công!" });
    });
};