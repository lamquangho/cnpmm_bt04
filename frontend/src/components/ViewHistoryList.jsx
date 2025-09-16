import { useState, useEffect } from 'react';
import { viewHistoryAPI } from '../utils/api';
import ProductCard from './ProductCard';

const ViewHistoryList = () => {
    const [viewHistory, setViewHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        loadViewHistory();
    }, []);

    const loadViewHistory = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await viewHistoryAPI.getAll({ page, limit: 12 });

            if (response.data.success) {
                setViewHistory(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Lỗi khi tải lịch sử xem:', error);
            if (error.response?.status === 401) {
                setError('Vui lòng đăng nhập để xem lịch sử');
            } else {
                setError('Có lỗi xảy ra khi tải lịch sử xem');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        loadViewHistory(page);
    };

    const handleRemoveItem = async (productId) => {
        try {
            await viewHistoryAPI.remove(productId);
            setViewHistory(prev => prev.filter(item => item.product._id !== productId));
        } catch (error) {
            console.error('Lỗi khi xóa khỏi lịch sử:', error);
            alert('Có lỗi xảy ra khi xóa sản phẩm khỏi lịch sử');
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử xem?')) return;

        try {
            await viewHistoryAPI.clear();
            setViewHistory([]);
            setPagination({});
        } catch (error) {
            console.error('Lỗi khi xóa toàn bộ lịch sử:', error);
            alert('Có lỗi xảy ra khi xóa lịch sử');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <button
                    onClick={() => loadViewHistory()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (viewHistory.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                    <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Bạn chưa xem sản phẩm nào
                </div>
                <p className="text-gray-400">Lịch sử xem sẽ hiển thị ở đây khi bạn xem sản phẩm</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    Sản phẩm đã xem ({pagination.totalItems || 0})
                </h2>
                {viewHistory.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                        Xóa toàn bộ lịch sử
                    </button>
                )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {viewHistory.map((item) => (
                    <div key={item._id} className="relative group">
                        <ProductCard product={item.product} />

                        {/* View Info Overlay */}
                        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            <div>Xem {item.viewCount} lần</div>
                            <div>{new Date(item.lastViewedAt).toLocaleDateString('vi-VN')}</div>
                        </div>

                        {/* Remove Button */}
                        <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xóa khỏi lịch sử"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <nav className="flex space-x-1">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${pagination.hasPrevPage
                                    ? 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-300'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Trước
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${page === pagination.currentPage
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-300'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${pagination.hasNextPage
                                    ? 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-300'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            Sau
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default ViewHistoryList;
