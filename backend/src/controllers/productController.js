const Product = require('../models/Product');
const Category = require('../models/Category');

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

module.exports = {
  getProducts,
  getProductsByCategory,
  getProductById,
  getFeaturedProducts
};
