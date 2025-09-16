import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Button, Typography, Spin, Alert, Image, Rate, Divider } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { productsAPI, viewHistoryAPI } from '../utils/api';
import FavoriteButtonAntD from '../components/FavoriteButtonAntD';
import SimilarProducts from '../components/SimilarProducts';
import ProductStats from '../components/ProductStats';
import CommentSection from '../components/CommentSection';

const { Title, Text } = Typography;

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (id) {
            loadProduct();
            trackView();
        }
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productsAPI.getById(id);

            if (response.data.success) {
                setProduct(response.data.data);
                document.title = `${response.data.data.name} - Shop`;
            }
        } catch (error) {
            console.error('Lỗi khi tải chi tiết sản phẩm:', error);
            setError('Không thể tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const trackView = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await viewHistoryAPI.add(id);
            } catch (error) {
                console.error('Lỗi khi lưu lịch sử xem:', error);
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ padding: '50px 0' }}>
                <Alert
                    message="Lỗi"
                    description={error || 'Không tìm thấy sản phẩm'}
                    type="error"
                    showIcon
                    action={
                        <Button onClick={() => window.history.back()}>
                            Quay lại
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Product Details */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={32}>
                    {/* Product Images */}
                    <Col xs={24} md={12}>
                        <div style={{ marginBottom: 16 }}>
                            <Image
                                width="100%"
                                height={400}
                                src={product.images?.[selectedImage] || 'https://via.placeholder.com/400x400'}
                                alt={product.name}
                                style={{ objectFit: 'cover', borderRadius: 8 }}
                            />
                        </div>

                        {product.images?.length > 1 && (
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                                {product.images.map((image, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        style={{
                                            flexShrink: 0,
                                            width: 80,
                                            height: 80,
                                            border: index === selectedImage ? '2px solid #1890ff' : '2px solid #d9d9d9',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Col>

                    {/* Product Info */}
                    <Col xs={24} md={12}>
                        <div style={{ marginBottom: 16 }}>
                            <Title level={2}>{product.name}</Title>
                            <Text type="secondary">{product.description}</Text>
                        </div>

                        {/* Rating */}
                        <div style={{ marginBottom: 16 }}>
                            <Rate disabled value={product.ratings?.average || 0} />
                            <Text style={{ marginLeft: 8 }}>
                                ({product.ratings?.count || 0} đánh giá)
                            </Text>
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: 16 }}>
                            <Title level={3} type="danger">
                                {formatPrice(product.price)}
                            </Title>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <div>
                                    <Text delete style={{ fontSize: 16, marginRight: 8 }}>
                                        {formatPrice(product.originalPrice)}
                                    </Text>
                                    <Text type="danger">
                                        Tiết kiệm {Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </Text>
                                </div>
                            )}
                        </div>

                        {/* Stock */}
                        <div style={{ marginBottom: 16 }}>
                            <Text>Còn lại: <Text strong>{product.stock}</Text> sản phẩm</Text>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                disabled={product.stock === 0}
                                style={{ flex: 1 }}
                            >
                                {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                            </Button>
                            <FavoriteButtonAntD productId={product._id} size="large" />
                        </div>

                        {/* Product Info */}
                        <Divider />
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Danh mục:</Text>
                                <Text>{product.category?.name}</Text>
                            </div>
                            {product.brand && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text type="secondary">Thương hiệu:</Text>
                                    <Text>{product.brand}</Text>
                                </div>
                            )}
                            {product.sku && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary">SKU:</Text>
                                    <Text>{product.sku}</Text>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Product Stats */}
            <Card title="Thống kê sản phẩm" style={{ marginBottom: 24 }}>
                <ProductStats productId={product._id} />
            </Card>

            {/* Comments Section */}
            <Card style={{ marginBottom: 24 }}>
                <CommentSection productId={product._id} />
            </Card>

            {/* Similar Products */}
            <Card>
                <SimilarProducts productId={product._id} />
            </Card>
        </div>
    );
};

export default ProductDetail;