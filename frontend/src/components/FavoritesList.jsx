import { useState, useEffect } from 'react';
import { favoritesAPI } from '../utils/api';
import ProductCard from './ProductCard';

const FavoritesList = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await favoritesAPI.getAll({ page, limit: 12 });

            if (response.data.success) {
                setFavorites(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách yêu thích:', error);
            if (error.response?.status === 401) {
                setError('Vui lòng đăng nhập để xem danh sách yêu thích');
            } else {
                setError('Có lỗi xảy ra khi tải danh sách yêu thích');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        loadFavorites(page);
    };

    const handleRemoveFavorite = (productId) => {
        // Cập nhật danh sách sau khi xóa yêu thích
        setFavorites(prev => prev.filter(fav => fav.product._id !== productId));
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
                    onClick={() => loadFavorites()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                    <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Bạn chưa có sản phẩm yêu thích nào
                </div>
                <p className="text-gray-400">Hãy khám phá và thêm những sản phẩm bạn thích!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                    Sản phẩm yêu thích ({pagination.totalItems || 0})
                </h2>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((favorite) => (
                    <div key={favorite._id} className="relative">
                        <ProductCard
                            product={favorite.product}
                            onFavoriteChange={() => handleRemoveFavorite(favorite.product._id)}
                        />
                        {/* Hiển thị ngày thêm yêu thích */}
                        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {new Date(favorite.createdAt).toLocaleDateString('vi-VN')}
                        </div>
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

export default FavoritesList;
