const express = require('express');
const router = express.Router();
const {
    addToViewHistory,
    getViewHistory,
    removeFromViewHistory,
    clearViewHistory,
    getMostViewedProducts
} = require('../controllers/viewHistoryController');
const auth = require('../middleware/auth');

// GET /api/view-history/most-viewed - Lấy sản phẩm xem nhiều nhất (không cần auth)
router.get('/most-viewed', getMostViewedProducts);

// Các routes sau cần authentication
router.use(auth);

// POST /api/view-history/:productId - Ghi lại lịch sử xem
router.post('/:productId', addToViewHistory);

// GET /api/view-history - Lấy lịch sử xem của user
router.get('/', getViewHistory);

// DELETE /api/view-history/:productId - Xóa sản phẩm khỏi lịch sử xem
router.delete('/:productId', removeFromViewHistory);

// DELETE /api/view-history - Xóa toàn bộ lịch sử xem
router.delete('/', clearViewHistory);

module.exports = router;
