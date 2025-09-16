import { useState, useEffect } from 'react';
import { favoritesAPI } from '../utils/api';

const FavoriteButton = ({ productId, className = '', size = 'medium', onFavoriteChange }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Kiểm tra đăng nhập
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        if (token && productId) {
            checkFavoriteStatus();
        }
    }, [productId]);

    const checkFavoriteStatus = async () => {
        try {
            const response = await favoritesAPI.checkStatus(productId);
            setIsFavorite(response.data.isFavorite);
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
        }
    };

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            alert('Vui lòng đăng nhập để thêm sản phẩm yêu thích');
            return;
        }

        setLoading(true);
        try {
            if (isFavorite) {
                await favoritesAPI.remove(productId);
                setIsFavorite(false);
                if (onFavoriteChange) onFavoriteChange(productId, false);
            } else {
                await favoritesAPI.add(productId);
                setIsFavorite(true);
                if (onFavoriteChange) onFavoriteChange(productId, true);
            }
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        // Hiển thị button nhưng disabled khi chưa đăng nhập
        return (
            <button
                onClick={() => alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích')}
                className={`
          ${sizeClasses[size]}
          ${className}
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          border-2
          bg-white text-gray-300 border-gray-300 hover:text-red-300 hover:border-red-300
          focus:outline-none
        `}
                title="Đăng nhập để yêu thích"
            >
                <svg
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>
        );
    }

    const sizeClasses = {
        small: 'w-6 h-6 text-sm',
        medium: 'w-8 h-8 text-base',
        large: 'w-10 h-10 text-lg'
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`
        ${sizeClasses[size]}
        ${className}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        border-2
        ${isFavorite
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                    : 'bg-white text-gray-400 border-gray-300 hover:text-red-500 hover:border-red-500'
                }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        focus:outline-none focus:ring-2 focus:ring-red-300
      `}
            title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
            {loading ? (
                <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4"></div>
            ) : (
                <svg
                    className="w-full h-full"
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            )}
        </button>
    );
};

export default FavoriteButton;
