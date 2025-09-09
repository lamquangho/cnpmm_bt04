const elasticsearchService = require('../services/elasticsearchService');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Fuzzy search với advanced filters sử dụng Elasticsearch
const fuzzySearchProducts = async (req, res) => {
    try {
        const {
            q: query = '',
            category = '',
            minPrice = 0,
            maxPrice = 999999999,
            brand = '',
            hasDiscount = false,
            hasPromotion = false,
            promotionType = '',
            minViews = 0,
            minRating = 0,
            sortBy = 'relevance',
            page = 1,
            limit = 12
        } = req.query;

        // Chuyển đổi string thành boolean/number
        const searchParams = {
            query: query.trim(),
            category,
            minPrice: parseFloat(minPrice) || 0,
            maxPrice: parseFloat(maxPrice) || 999999999,
            brand,
            hasDiscount: hasDiscount === 'true',
            hasPromotion: hasPromotion === 'true',
            promotionType,
            minViews: parseInt(minViews) || 0,
            minRating: parseFloat(minRating) || 0,
            sortBy,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 12
        };

        try {
            // Thử search với Elasticsearch trước
            const result = await elasticsearchService.searchProducts(searchParams);

            res.json({
                success: true,
                data: result.products,
                pagination: result.pagination,
                searchInfo: {
                    query: searchParams.query,
                    took: result.took,
                    engine: 'elasticsearch',
                    fuzzy: true
                }
            });
        } catch (elasticError) {
            console.warn('Elasticsearch không khả dụng, fallback về MongoDB:', elasticError.message);

            // Fallback về MongoDB search
            const mongoResult = await fallbackMongoSearch(searchParams);

            res.json({
                success: true,
                data: mongoResult.products,
                pagination: mongoResult.pagination,
                searchInfo: {
                    query: searchParams.query,
                    engine: 'mongodb',
                    fuzzy: false
                }
            });
        }
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tìm kiếm sản phẩm'
        });
    }
};

// Fallback search sử dụng MongoDB
const fallbackMongoSearch = async (params) => {
    const {
        query,
        category,
        minPrice,
        maxPrice,
        brand,
        hasDiscount,
        hasPromotion,
        promotionType,
        minViews,
        minRating,
        sortBy,
        page,
        limit
    } = params;

    const skip = (page - 1) * limit;

    // Xây dựng MongoDB filter
    let filter = { isActive: true };

    // Text search
    if (query) {
        filter.$or = [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { searchKeywords: { $in: [new RegExp(query, 'i')] } },
            { brand: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ];
    }

    // Category filter
    if (category) {
        filter.category = category;
    }

    // Price range
    filter.price = { $gte: minPrice, $lte: maxPrice };

    // Brand filter
    if (brand) {
        filter.brand = new RegExp(brand, 'i');
    }

    // Discount filter (regular discounts)
    if (hasDiscount) {
        filter['discount.isActive'] = true;
    }

    // Promotion filter (special campaigns)
    if (hasPromotion) {
        filter['promotion.isActive'] = true;
    }

    // Promotion type filter
    if (promotionType) {
        filter['promotion.type'] = promotionType;
        filter['promotion.isActive'] = true;
    }

    // Views filter
    if (minViews > 0) {
        filter.views = { $gte: minViews };
    }

    // Rating filter
    if (minRating > 0) {
        filter['ratings.average'] = { $gte: minRating };
    }

    // Sorting
    const sortOptions = {
        relevance: { featured: -1, createdAt: -1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        views: { views: -1 },
        rating: { 'ratings.average': -1 },
        name_asc: { name: 1 },
        name_desc: { name: -1 }
    };

    const sort = sortOptions[sortBy] || sortOptions.relevance;

    const products = await Product.find(filter)
        .populate('category', 'name description')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Product.countDocuments(filter);

    return {
        products,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
        }
    };
};

// Lấy gợi ý tự động hoàn thành
const getSearchSuggestions = async (req, res) => {
    try {
        const { q: query, limit = 5 } = req.query;

        if (!query || query.trim().length < 2) {
            return res.json({
                success: true,
                data: []
            });
        }

        try {
            const suggestions = await elasticsearchService.getSuggestions(query.trim(), limit);

            res.json({
                success: true,
                data: suggestions
            });
        } catch (elasticError) {
            // Fallback tới MongoDB cho suggestions
            const products = await Product.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { searchKeywords: { $in: [new RegExp(query, 'i')] } }
                ],
                isActive: true
            })
                .select('name')
                .limit(limit)
                .lean();

            const suggestions = products.map(p => ({
                text: p.name,
                score: 1
            }));

            res.json({
                success: true,
                data: suggestions
            });
        }
    } catch (error) {
        console.error('Lỗi khi lấy suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy gợi ý'
        });
    }
};

// Lấy các filter options (brands, categories, price ranges, etc.)
const getFilterOptions = async (req, res) => {
    try {
        const [categories, brands, priceRanges, promotions, viewsStats] = await Promise.all([
            // Categories
            Category.find({ isActive: true }).select('name description').lean(),

            // Brands (top brands)
            Product.aggregate([
                { $match: { isActive: true, brand: { $exists: true, $ne: null, $ne: '' } } },
                { $group: { _id: '$brand', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 },
                { $project: { brand: '$_id', count: 1, _id: 0 } }
            ]),

            // Price ranges
            Product.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' },
                        avgPrice: { $avg: '$price' }
                    }
                }
            ]),

            // Promotion types
            Product.aggregate([
                {
                    $match: {
                        isActive: true,
                        'promotion.isActive': true,
                        'promotion.type': { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: { type: '$promotion.type', label: '$promotion.label' },
                        count: { $sum: 1 },
                        avgPercentage: { $avg: '$promotion.percentage' }
                    }
                },
                { $sort: { count: -1 } },
                {
                    $project: {
                        type: '$_id.type',
                        label: '$_id.label',
                        count: 1,
                        avgPercentage: { $round: ['$avgPercentage', 1] },
                        _id: 0
                    }
                }
            ]),

            // Views statistics
            Product.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        minViews: { $min: '$views' },
                        maxViews: { $max: '$views' },
                        avgViews: { $avg: '$views' }
                    }
                }
            ])
        ]);

        res.json({
            success: true,
            data: {
                categories,
                brands,
                priceRange: priceRanges[0] || { minPrice: 0, maxPrice: 1000000, avgPrice: 500000 },
                promotions,
                viewsRange: viewsStats[0] || { minViews: 0, maxViews: 1000, avgViews: 200 },
                discountOptions: [
                    { label: 'Có giảm giá thường', value: 'true', count: await Product.countDocuments({ 'discount.isActive': true }) }
                ],
                promotionOptions: [
                    { label: 'Có chương trình khuyến mãi', value: 'true', count: await Product.countDocuments({ 'promotion.isActive': true }) }
                ],
                ratingOptions: [
                    { label: '5 sao', value: 5 },
                    { label: '4 sao trở lên', value: 4 },
                    { label: '3 sao trở lên', value: 3 },
                    { label: '2 sao trở lên', value: 2 },
                    { label: '1 sao trở lên', value: 1 }
                ],
                viewsOptions: [
                    { label: 'Trên 500 lượt xem', value: 500 },
                    { label: 'Trên 300 lượt xem', value: 300 },
                    { label: 'Trên 100 lượt xem', value: 100 },
                    { label: 'Tất cả', value: 0 }
                ]
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy filter options:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy filter options'
        });
    }
};

// Tăng view count cho sản phẩm
const incrementProductView = async (req, res) => {
    try {
        const { productId } = req.params;

        await Product.findByIdAndUpdate(
            productId,
            { $inc: { views: 1 } },
            { new: true }
        );

        res.json({
            success: true,
            message: 'View count đã được cập nhật'
        });
    } catch (error) {
        console.error('Lỗi khi tăng view:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật view'
        });
    }
};

module.exports = {
    fuzzySearchProducts,
    getSearchSuggestions,
    getFilterOptions,
    incrementProductView
};
