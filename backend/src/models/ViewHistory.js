const mongoose = require('mongoose');

const viewHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    viewCount: {
        type: Number,
        default: 1
    },
    lastViewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tìm kiếm hiệu quả
viewHistorySchema.index({ user: 1, lastViewedAt: -1 });
viewHistorySchema.index({ user: 1, product: 1 }, { unique: true });
viewHistorySchema.index({ product: 1 });

module.exports = mongoose.model('ViewHistory', viewHistorySchema);
