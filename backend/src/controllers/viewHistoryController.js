const ViewHistory = require('../models/ViewHistory');
const Product = require('../models/Product');

// Ghi lại lịch sử xem sản phẩm
const addToViewHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Tìm hoặc tạo mới lịch sử xem
        let viewHistory = await ViewHistory.findOne({
            user: userId,
            product: productId
        });

        if (viewHistory) {
            // Nếu đã có, cập nhật số lần xem và thời gian xem cuối
            viewHistory.viewCount += 1;
            viewHistory.lastViewedAt = new Date();
            await viewHistory.save();
        } else {
            // Nếu chưa có, tạo mới
            viewHistory = new ViewHistory({
                user: userId,
                product: productId,
                viewCount: 1,
                lastViewedAt: new Date()
            });
            await viewHistory.save();
        }

        // Cập nhật số lượt xem của sản phẩm
        await Product.findByIdAndUpdate(productId, {
            $inc: { views: 1 }
        });

        res.json({
            success: true,
            message: 'Đã ghi lại lịch sử xem sản phẩm',
            data: viewHistory
        });
    } catch (error) {
        console.error('Lỗi khi ghi lại lịch sử xem:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi ghi lại lịch sử xem'
        });
    }
};

// Lấy lịch sử xem sản phẩm của user
const getViewHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const viewHistory = await ViewHistory.find({ user: userId })
            .populate({
                path: 'product',
                populate: {
                    path: 'category',
                    select: 'name description'
                }
            })
            .sort({ lastViewedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ViewHistory.countDocuments({ user: userId });
        const totalPages = Math.ceil(total / limit);

        // Lọc ra những sản phẩm vẫn còn active
        const activeViewHistory = viewHistory.filter(view => view.product && view.product.isActive);

        res.json({
            success: true,
            data: activeViewHistory,
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
        console.error('Lỗi khi lấy lịch sử xem:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy lịch sử xem'
        });
    }
};

// Xóa lịch sử xem sản phẩm cụ thể
const removeFromViewHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const viewHistory = await ViewHistory.findOneAndDelete({
            user: userId,
            product: productId
        });

        if (!viewHistory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch sử xem sản phẩm này'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi lịch sử xem'
        });
    } catch (error) {
        console.error('Lỗi khi xóa lịch sử xem:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa lịch sử xem'
        });
    }
};

// Xóa toàn bộ lịch sử xem
const clearViewHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        await ViewHistory.deleteMany({ user: userId });

        res.json({
            success: true,
            message: 'Đã xóa toàn bộ lịch sử xem'
        });
    } catch (error) {
        console.error('Lỗi khi xóa toàn bộ lịch sử xem:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa toàn bộ lịch sử xem'
        });
    }
};

// Lấy sản phẩm được xem nhiều nhất
const getMostViewedProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const mostViewed = await Product.find({ isActive: true })
            .populate('category', 'name description')
            .sort({ views: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: mostViewed
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm được xem nhiều nhất:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy sản phẩm được xem nhiều nhất'
        });
    }
};

module.exports = {
    addToViewHistory,
    getViewHistory,
    removeFromViewHistory,
    clearViewHistory,
    getMostViewedProducts
};
