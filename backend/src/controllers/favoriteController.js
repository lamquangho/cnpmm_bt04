const Favorite = require('../models/Favorite');
const Product = require('../models/Product');

// Thêm sản phẩm vào danh sách yêu thích
const addToFavorites = async (req, res) => {
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

        // Kiểm tra đã yêu thích chưa
        const existingFavorite = await Favorite.findOne({
            user: userId,
            product: productId
        });

        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm đã có trong danh sách yêu thích'
            });
        }

        // Thêm vào yêu thích
        const favorite = new Favorite({
            user: userId,
            product: productId
        });

        await favorite.save();

        res.status(201).json({
            success: true,
            message: 'Đã thêm sản phẩm vào danh sách yêu thích',
            data: favorite
        });
    } catch (error) {
        console.error('Lỗi khi thêm yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm vào yêu thích'
        });
    }
};

// Xóa sản phẩm khỏi danh sách yêu thích
const removeFromFavorites = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const favorite = await Favorite.findOneAndDelete({
            user: userId,
            product: productId
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không có trong danh sách yêu thích'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi danh sách yêu thích'
        });
    } catch (error) {
        console.error('Lỗi khi xóa yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa khỏi yêu thích'
        });
    }
};

// Lấy danh sách sản phẩm yêu thích của user
const getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const favorites = await Favorite.find({ user: userId })
            .populate({
                path: 'product',
                populate: {
                    path: 'category',
                    select: 'name description'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Favorite.countDocuments({ user: userId });
        const totalPages = Math.ceil(total / limit);

        // Lọc ra những sản phẩm vẫn còn active
        const activeFavorites = favorites.filter(fav => fav.product && fav.product.isActive);

        res.json({
            success: true,
            data: activeFavorites,
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
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách yêu thích'
        });
    }
};

// Kiểm tra sản phẩm có trong danh sách yêu thích không
const checkFavoriteStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const favorite = await Favorite.findOne({
            user: userId,
            product: productId
        });

        res.json({
            success: true,
            isFavorite: !!favorite
        });
    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi kiểm tra trạng thái yêu thích'
        });
    }
};

// Lấy số lượng sản phẩm yêu thích của user
const getFavoriteCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await Favorite.countDocuments({ user: userId });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Lỗi khi đếm số lượng yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi đếm số lượng yêu thích'
        });
    }
};

module.exports = {
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    checkFavoriteStatus,
    getFavoriteCount
};
