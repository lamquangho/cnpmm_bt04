import { useState, useEffect } from 'react';
import { Row, Col, Spin, Alert, Button, Typography } from 'antd';
import { productsAPI } from '../utils/api';
import ProductCard from './ProductCard';

const { Title, Text } = Typography;

const SimilarProducts = ({ productId, className = '' }) => {
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (productId) {
            loadSimilarProducts();
        }
    }, [productId]);

    const loadSimilarProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productsAPI.getSimilar(productId, { limit: 8 });

            if (response.data.success) {
                setSimilarProducts(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm tương tự:', error);
            setError('Có lỗi xảy ra khi tải sản phẩm tương tự');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Title level={4}>Sản phẩm tương tự</Title>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Title level={4}>Sản phẩm tương tự</Title>
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={loadSimilarProducts}>
                            Thử lại
                        </Button>
                    }
                />
            </div>
        );
    }

    if (similarProducts.length === 0) {
        return (
            <div>
                <Title level={4}>Sản phẩm tương tự</Title>
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text type="secondary">Không tìm thấy sản phẩm tương tự</Text>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Sản phẩm tương tự</Title>
                <Text type="secondary">
                    {similarProducts.length} sản phẩm
                </Text>
            </div>

            {/* Products Grid */}
            <Row gutter={[16, 16]}>
                {similarProducts.map((product) => (
                    <Col xs={24} sm={12} lg={6} key={product._id}>
                        <ProductCard product={product} />
                    </Col>
                ))}
            </Row>

            {/* View More Button */}
            {similarProducts.length >= 8 && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Button
                        type="primary"
                        onClick={() => {
                            // Navigate to products page with similar filter
                            window.location.href = `/products?similar=${productId}`;
                        }}
                    >
                        Xem thêm sản phẩm tương tự
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SimilarProducts;
