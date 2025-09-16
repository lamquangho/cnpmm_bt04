const Comment = require('../models/Comment');
const Product = require('../models/Product');

// Tạo bình luận mới
const createComment = async (req, res) => {
    try {
        const { productId } = req.params;
        const { content, rating, parentComment } = req.body;
        const userId = req.user.id;

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Kiểm tra parent comment nếu có (cho reply)
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (!parent || parent.product.toString() !== productId) {
                return res.status(400).json({
                    success: false,
                    message: 'Bình luận cha không hợp lệ'
                });
            }
        }

        // Tạo bình luận mới
        const comment = new Comment({
            user: userId,
            product: productId,
            content,
            rating: parentComment ? undefined : rating, // Chỉ comment gốc mới có rating
            parentComment: parentComment || null
        });

        await comment.save();

        // Nếu là reply, thêm vào danh sách replies của parent
        if (parentComment) {
            await Comment.findByIdAndUpdate(parentComment, {
                $push: { replies: comment._id }
            });
        }

        // Cập nhật rating trung bình của sản phẩm nếu có rating
        if (rating && !parentComment) {
            await updateProductRating(productId);
        }

        // Populate thông tin user cho response
        await comment.populate('user', 'username');

        res.status(201).json({
            success: true,
            message: 'Đã tạo bình luận thành công',
            data: comment
        });
    } catch (error) {
        console.error('Lỗi khi tạo bình luận:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo bình luận'
        });
    }
};

// Lấy danh sách bình luận của sản phẩm
const getProductComments = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Lấy comments gốc (không có parentComment)
        const comments = await Comment.find({
            product: productId,
            isActive: true,
            parentComment: null
        })
            .populate('user', 'username')
            .populate({
                path: 'replies',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({
            product: productId,
            isActive: true,
            parentComment: null
        });

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: comments,
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
        console.error('Lỗi khi lấy bình luận:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy bình luận'
        });
    }
};

// Cập nhật bình luận
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, rating } = req.body;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận'
            });
        }

        // Kiểm tra quyền sở hữu
        if (comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền sửa bình luận này'
            });
        }

        // Cập nhật content
        if (content) comment.content = content;

        // Chỉ cập nhật rating cho comment gốc
        if (rating && !comment.parentComment) {
            comment.rating = rating;
        }

        await comment.save();

        // Cập nhật lại rating trung bình nếu có thay đổi rating
        if (rating && !comment.parentComment) {
            await updateProductRating(comment.product);
        }

        await comment.populate('user', 'username');

        res.json({
            success: true,
            message: 'Đã cập nhật bình luận thành công',
            data: comment
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật bình luận:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật bình luận'
        });
    }
};

// Xóa bình luận (soft delete)
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bình luận'
            });
        }

        // Kiểm tra quyền sở hữu
        if (comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa bình luận này'
            });
        }

        // Soft delete
        comment.isActive = false;
        await comment.save();

        // Cập nhật lại rating trung bình nếu là comment có rating
        if (comment.rating && !comment.parentComment) {
            await updateProductRating(comment.product);
        }

        res.json({
            success: true,
            message: 'Đã xóa bình luận thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa bình luận'
        });
    }
};

// Hàm helper để cập nhật rating trung bình của sản phẩm
const updateProductRating = async (productId) => {
    try {
        const ratingStats = await Comment.aggregate([
            {
                $match: {
                    product: productId,
                    isActive: true,
                    parentComment: null,
                    rating: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = ratingStats.length > 0 ? ratingStats[0] : { averageRating: 0, count: 0 };

        await Product.findByIdAndUpdate(productId, {
            'ratings.average': Math.round(stats.averageRating * 10) / 10,
            'ratings.count': stats.count
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật rating sản phẩm:', error);
    }
};

// Lấy bình luận của user
const getUserComments = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({
            user: userId,
            isActive: true
        })
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({
            user: userId,
            isActive: true
        });

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: comments,
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
        console.error('Lỗi khi lấy bình luận của user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy bình luận của user'
        });
    }
};

module.exports = {
    createComment,
    getProductComments,
    updateComment,
    deleteComment,
    getUserComments
};
