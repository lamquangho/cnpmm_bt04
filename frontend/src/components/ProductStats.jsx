import { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Alert, Typography, Rate } from 'antd';
import { UserOutlined, ShoppingOutlined, EyeOutlined, HeartOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { productsAPI } from '../utils/api';

const { Text, Title } = Typography;

const ProductStats = ({ productId, className = '' }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (productId) {
            loadStats();
        }
    }, [productId]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productsAPI.getStats(productId);

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải thống kê sản phẩm:', error);
            setError('Có lỗi xảy ra khi tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
            />
        );
    }

    if (!stats) return null;

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };


    return (
        <div>
            {/* Main Stats Grid */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                {/* Customers Count */}
                <Col xs={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <UserOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                {formatNumber(stats.customerCount)}
                            </div>
                            <Text type="secondary">Khách đã mua</Text>
                        </div>
                    </Card>
                </Col>

                {/* Total Sold */}
                <Col xs={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <ShoppingOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                {formatNumber(stats.totalSold)}
                            </div>
                            <Text type="secondary">Đã bán</Text>
                        </div>
                    </Card>
                </Col>

                {/* Views */}
                <Col xs={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <EyeOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                                {formatNumber(stats.views)}
                            </div>
                            <Text type="secondary">Lượt xem</Text>
                        </div>
                    </Card>
                </Col>

                {/* Favorites */}
                <Col xs={12} md={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <HeartOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 8 }} />
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                                {formatNumber(stats.favoriteCount)}
                            </div>
                            <Text type="secondary">Yêu thích</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Comments & Rating Stats */}
            <Row gutter={16}>
                {/* Comments */}
                <Col xs={24} md={12}>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <Text strong style={{ fontSize: 16 }}>
                                    {stats.commentCount} bình luận
                                </Text>
                                <div>
                                    <Text type="secondary">
                                        từ {stats.commentCustomerCount} khách hàng
                                    </Text>
                                </div>
                            </div>
                            <MessageOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />
                        </div>
                    </Card>
                </Col>

                {/* Rating */}
                <Col xs={24} md={12}>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Text strong style={{ fontSize: 16 }}>
                                        {stats.averageRating > 0 ? stats.averageRating : 'Chưa có'}
                                    </Text>
                                    {stats.averageRating > 0 && (
                                        <Rate disabled value={stats.averageRating} style={{ fontSize: 14 }} />
                                    )}
                                </div>
                                <div>
                                    <Text type="secondary">
                                        {stats.ratingCount > 0 ? `${stats.ratingCount} đánh giá` : 'Chưa có đánh giá'}
                                    </Text>
                                </div>
                            </div>
                            <StarOutlined style={{ fontSize: 32, color: '#faad14' }} />
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProductStats;
