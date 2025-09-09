const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Mô tả sản phẩm là bắt buộc'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá không thể âm']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Giá gốc không thể âm']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Danh mục sản phẩm là bắt buộc']
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    required: [true, 'Số lượng tồn kho là bắt buộc'],
    min: [0, 'Số lượng không thể âm'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  views: {
    type: Number,
    default: 0
  },
  discount: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 70  // Giảm giá tối đa 70%
    },
    isActive: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    reason: {
      type: String,
      default: 'Giảm giá đặc biệt'
    }
  },
  promotion: {
    type: {
      type: String,
      enum: ['flash_sale', 'clearance', 'new_arrival', 'bestseller', 'limited_edition'],
      sparse: true
    },
    label: {
      type: String,
      sparse: true  // VD: "Flash Sale", "Hàng mới về"
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 90  // Khuyến mãi có thể lên tới 90%
    },
    isActive: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    },
    startDate: Date,
    endDate: Date
  },
  brand: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  searchKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index để tìm kiếm hiệu quả
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', searchKeywords: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ views: -1 });
productSchema.index({ 'discount.isActive': 1, 'discount.percentage': -1 });
productSchema.index({ 'promotion.isActive': 1, 'promotion.priority': -1 });
productSchema.index({ brand: 1 });
productSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', productSchema);
