const express = require('express');
const router = express.Router();
const {
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    checkFavoriteStatus,
    getFavoriteCount
} = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

// Tất cả routes đều cần authentication
router.use(auth);

// GET /api/favorites/count - Lấy số lượng sản phẩm yêu thích
router.get('/count', getFavoriteCount);

// GET /api/favorites - Lấy danh sách sản phẩm yêu thích
router.get('/', getFavorites);

// POST /api/favorites/:productId - Thêm sản phẩm vào yêu thích
router.post('/:productId', addToFavorites);

// DELETE /api/favorites/:productId - Xóa sản phẩm khỏi yêu thích
router.delete('/:productId', removeFromFavorites);

// GET /api/favorites/:productId/status - Kiểm tra trạng thái yêu thích
router.get('/:productId/status', checkFavoriteStatus);

module.exports = router;
