const Product = require('../models/Product');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const Order = require('../models/Order');
const Favorite = require('../models/Favorite');

// Lấy tất cả sản phẩm với pagination
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';

    // Xây dựng query filter
    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Xây dựng sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Thực hiện query với pagination
    const products = await Product.find(filter)
      .populate('category', 'name description')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Đếm tổng số sản phẩm
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy sản phẩm'
    });
  }
};

// Lấy sản phẩm theo danh mục với lazy loading
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';

    // Kiểm tra danh mục có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find({
      category: categoryId,
      isActive: true
    })
      .populate('category', 'name description')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({
      category: categoryId,
      isActive: true
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products,
      category: category,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo danh mục:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy sản phẩm theo danh mục'
    });
  }
};

// Lấy chi tiết sản phẩm
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name description')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết sản phẩm'
    });
  }
};

// Lấy sản phẩm nổi bật
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      featured: true,
      isActive: true
    })
      .populate('category', 'name description')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm nổi bật:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy sản phẩm nổi bật'
    });
  }
};

// Lấy sản phẩm tương tự
const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 8;

    // Lấy thông tin sản phẩm hiện tại
    const currentProduct = await Product.findById(id).populate('category');
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Tìm sản phẩm tương tự dựa trên:
    // 1. Cùng danh mục
    // 2. Cùng brand (nếu có)
    // 3. Tags tương tự
    // 4. Khoảng giá tương tự (±50%)
    const priceRange = {
      min: currentProduct.price * 0.5,
      max: currentProduct.price * 1.5
    };

    let matchConditions = [
      // Cùng danh mục, khác id
      {
        category: currentProduct.category._id,
        _id: { $ne: id },
        isActive: true
      }
    ];

    // Nếu có brand, ưu tiên cùng brand
    if (currentProduct.brand) {
      matchConditions.unshift({
        brand: currentProduct.brand,
        _id: { $ne: id },
        isActive: true
      });
    }

    // Nếu có tags, tìm sản phẩm có tags tương tự
    if (currentProduct.tags && currentProduct.tags.length > 0) {
      matchConditions.unshift({
        tags: { $in: currentProduct.tags },
        _id: { $ne: id },
        isActive: true
      });
    }

    // Tìm sản phẩm trong khoảng giá tương tự
    matchConditions.push({
      price: { $gte: priceRange.min, $lte: priceRange.max },
      _id: { $ne: id },
      isActive: true
    });

    // Thực hiện aggregation để lấy sản phẩm tương tự
    const similarProducts = await Product.aggregate([
      {
        $match: {
          $or: matchConditions
        }
      },
      {
        $addFields: {
          similarityScore: {
            $add: [
              // Điểm cho cùng danh mục
              { $cond: [{ $eq: ['$category', currentProduct.category._id] }, 3, 0] },
              // Điểm cho cùng brand
              { $cond: [{ $eq: ['$brand', currentProduct.brand] }, 2, 0] },
              // Điểm cho tags tương tự
              { $cond: [{ $gt: [{ $size: { $setIntersection: ['$tags', currentProduct.tags] } }, 0] }, 1, 0] }
            ]
          }
        }
      },
      { $sort: { similarityScore: -1, views: -1, createdAt: -1 } },
      { $limit: limit }
    ]);

    // Populate category cho kết quả
    await Product.populate(similarProducts, {
      path: 'category',
      select: 'name description'
    });

    res.json({
      success: true,
      data: similarProducts
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm tương tự:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy sản phẩm tương tự'
    });
  }
};

// Lấy thống kê sản phẩm (số khách mua, số bình luận)
const getProductStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Đếm số khách đã mua (từ orders có status delivered)
    const customerCount = await Order.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.product': product._id,
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: '$user',
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      {
        $group: {
          _id: null,
          customerCount: { $sum: 1 },
          totalSold: { $sum: '$totalQuantity' }
        }
      }
    ]);

    // Đếm số bình luận
    const commentCount = await Comment.countDocuments({
      product: id,
      isActive: true
    });

    // Đếm số khách đã bình luận
    const commentCustomerCount = await Comment.distinct('user', {
      product: id,
      isActive: true
    });

    // Đếm số lượt yêu thích
    const favoriteCount = await Favorite.countDocuments({
      product: id
    });

    // Lấy rating trung bình từ comments
    const ratingStats = await Comment.aggregate([
      {
        $match: {
          product: product._id,
          isActive: true,
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      customerCount: customerCount.length > 0 ? customerCount[0].customerCount : 0,
      totalSold: customerCount.length > 0 ? customerCount[0].totalSold : 0,
      commentCount,
      commentCustomerCount: commentCustomerCount.length,
      favoriteCount,
      views: product.views || 0,
      averageRating: ratingStats.length > 0 ? Math.round(ratingStats[0].averageRating * 10) / 10 : 0,
      ratingCount: ratingStats.length > 0 ? ratingStats[0].ratingCount : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê sản phẩm'
    });
  }
};

// Lấy sản phẩm theo nhiều tiêu chí (bestseller, most viewed, etc.)
const getProductsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let products = [];
    let total = 0;

    switch (type) {
      case 'bestseller':
        // Sản phẩm bán chạy nhất
        const bestsellerData = await Order.aggregate([
          { $unwind: '$items' },
          {
            $match: {
              status: 'delivered'
            }
          },
          {
            $group: {
              _id: '$items.product',
              totalSold: { $sum: '$items.quantity' }
            }
          },
          { $sort: { totalSold: -1 } },
          { $skip: skip },
          { $limit: limit }
        ]);

        const productIds = bestsellerData.map(item => item._id);
        products = await Product.find({
          _id: { $in: productIds },
          isActive: true
        }).populate('category', 'name description');

        // Sắp xếp lại theo thứ tự bestseller
        const productMap = {};
        products.forEach(product => {
          productMap[product._id] = product;
        });
        products = productIds.map(id => productMap[id]).filter(Boolean);

        total = await Order.aggregate([
          { $unwind: '$items' },
          { $match: { status: 'delivered' } },
          { $group: { _id: '$items.product' } },
          { $count: 'total' }
        ]);
        total = total.length > 0 ? total[0].total : 0;
        break;

      case 'most-viewed':
        // Sản phẩm xem nhiều nhất
        products = await Product.find({ isActive: true })
          .populate('category', 'name description')
          .sort({ views: -1 })
          .skip(skip)
          .limit(limit);

        total = await Product.countDocuments({ isActive: true });
        break;

      case 'most-favorite':
        // Sản phẩm được yêu thích nhiều nhất
        const favoriteData = await Favorite.aggregate([
          {
            $group: {
              _id: '$product',
              favoriteCount: { $sum: 1 }
            }
          },
          { $sort: { favoriteCount: -1 } },
          { $skip: skip },
          { $limit: limit }
        ]);

        const favoriteProductIds = favoriteData.map(item => item._id);
        products = await Product.find({
          _id: { $in: favoriteProductIds },
          isActive: true
        }).populate('category', 'name description');

        // Sắp xếp lại theo thứ tự favorite
        const favoriteProductMap = {};
        products.forEach(product => {
          favoriteProductMap[product._id] = product;
        });
        products = favoriteProductIds.map(id => favoriteProductMap[id]).filter(Boolean);

        total = await Favorite.aggregate([
          { $group: { _id: '$product' } },
          { $count: 'total' }
        ]);
        total = total.length > 0 ? total[0].total : 0;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Loại sản phẩm không hợp lệ'
        });
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo loại:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy sản phẩm theo loại'
    });
  }
};

module.exports = {
  getProducts,
  getProductsByCategory,
  getProductById,
  getFeaturedProducts,
  getSimilarProducts,
  getProductStats,
  getProductsByType
};
