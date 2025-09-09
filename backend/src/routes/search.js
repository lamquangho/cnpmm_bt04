const express = require('express');
const router = express.Router();
const {
    fuzzySearchProducts,
    getSearchSuggestions,
    getFilterOptions,
    incrementProductView
} = require('../controllers/searchController');

// @route   GET /api/search
// @desc    Fuzzy search sản phẩm với advanced filters
// @access  Public
// Query params: q, category, minPrice, maxPrice, brand, hasDiscount, promotionType, minRating, sortBy, page, limit
router.get('/', fuzzySearchProducts);

// @route   GET /api/search/suggestions
// @desc    Lấy gợi ý tự động hoàn thành
// @access  Public
// Query params: q, limit
router.get('/suggestions', getSearchSuggestions);

// @route   GET /api/search/filters
// @desc    Lấy các filter options
// @access  Public
router.get('/filters', getFilterOptions);

// @route   POST /api/search/view/:productId
// @desc    Tăng view count cho sản phẩm
// @access  Public
router.post('/view/:productId', incrementProductView);

module.exports = router;
