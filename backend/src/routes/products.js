const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductsByCategory,
  getProductById,
  getFeaturedProducts
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

// @route   GET /api/products/:id
// @desc    Lấy chi tiết sản phẩm
// @access  Public
router.get('/:id', getProductById);

module.exports = router;
