const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductsByCategory,
  getProductById,
  getFeaturedProducts,
  getSimilarProducts,
  getProductStats,
  getProductsByType
} = require('../controllers/productController');

// @route   GET /api/products
// @desc    Lấy tất cả sản phẩm với pagination và filter
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/featured
// @desc    Lấy sản phẩm nổi bật
// @access  Public
router.get('/featured', getFeaturedProducts);

// @route   GET /api/products/category/:categoryId
// @desc    Lấy sản phẩm theo danh mục với pagination
// @access  Public
router.get('/category/:categoryId', getProductsByCategory);

// @route   GET /api/products/type/:type
// @desc    Lấy sản phẩm theo loại (bestseller, most-viewed, most-favorite)
// @access  Public
router.get('/type/:type', getProductsByType);

// @route   GET /api/products/:id
// @desc    Lấy chi tiết sản phẩm
// @access  Public
router.get('/:id', getProductById);

// @route   GET /api/products/:id/similar
// @desc    Lấy sản phẩm tương tự
// @access  Public
router.get('/:id/similar', getSimilarProducts);

// @route   GET /api/products/:id/stats
// @desc    Lấy thống kê sản phẩm (số khách mua, bình luận)
// @access  Public
router.get('/:id/stats', getProductStats);

module.exports = router;
