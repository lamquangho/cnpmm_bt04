const express = require('express');
const router = express.Router();
const {
    createComment,
    getProductComments,
    updateComment,
    deleteComment,
    getUserComments
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

// GET /api/comments/my - Lấy bình luận của user hiện tại
router.get('/my', auth, getUserComments);

// GET /api/comments/product/:productId - Lấy bình luận của sản phẩm
router.get('/product/:productId', getProductComments);

// POST /api/comments/product/:productId - Tạo bình luận mới (cần auth)
router.post('/product/:productId', auth, createComment);

// PUT /api/comments/:commentId - Cập nhật bình luận (cần auth)
router.put('/:commentId', auth, updateComment);

// DELETE /api/comments/:commentId - Xóa bình luận (cần auth)
router.delete('/:commentId', auth, deleteComment);

module.exports = router;
