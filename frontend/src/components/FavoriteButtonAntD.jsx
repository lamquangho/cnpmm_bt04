import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { favoritesAPI } from '../utils/api';

const FavoriteButtonAntD = ({ productId, size = 'middle', onFavoriteChange, style = {} }) => {
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
            // Nếu lỗi, coi như chưa yêu thích
            setIsFavorite(false);
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
            // Chỉ alert nếu không phải lỗi 401 (unauthorized)
            if (error.response?.status !== 401) {
                alert('Có lỗi xảy ra, vui lòng thử lại');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="text"
            size={size}
            loading={loading}
            onClick={toggleFavorite}
            style={{
                color: isFavorite ? '#ff4d4f' : isLoggedIn ? '#d9d9d9' : '#f0f0f0',
                border: 'none',
                boxShadow: 'none',
                ...style
            }}
            icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
            title={
                !isLoggedIn
                    ? 'Đăng nhập để yêu thích'
                    : isFavorite
                        ? 'Bỏ yêu thích'
                        : 'Thêm vào yêu thích'
            }
        />
    );
};

export default FavoriteButtonAntD;
