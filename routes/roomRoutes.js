const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// API Public: Tìm kiếm phòng (/api/rooms)
router.get('/rooms', roomController.searchRooms);

// Định nghĩa các route Admin
router.get('/admin/rooms', verifyAdmin, roomController.getAllRoomsAdmin);
router.post('/admin/rooms', verifyAdmin, roomController.createRoom);
router.put('/admin/rooms/:id', verifyAdmin, roomController.updateRoom);
router.delete('/admin/rooms/:id', verifyAdmin, roomController.deleteRoom); 

module.exports = router;