const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById
} = require('../controllers/categoryController');

// @route   GET /api/categories
// @desc    Lấy tất cả danh mục
// @access  Public
router.get('/', getCategories);

// @route   GET /api/categories/:id
// @desc    Lấy chi tiết danh mục
// @access  Public
router.get('/:id', getCategoryById);

module.exports = router;
