const Category = require('../models/Category');

// Lấy tất cả danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh mục:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh mục'
    });
  }
};

// Lấy chi tiết danh mục
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id).lean();
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết danh mục:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết danh mục'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById
};
