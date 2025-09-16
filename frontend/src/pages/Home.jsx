import React, { useState, useEffect } from 'react';
import { Card, Typography, Alert, Button, Row, Col, Divider } from 'antd';
import { AppstoreOutlined, ShoppingOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FeatureDemo from '../components/FeatureDemo';
import { productsAPI, categoriesAPI } from '../utils/api';
import api from '../utils/api';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch user if token exists
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userResponse = await api.get('/auth/me');
          setUser(userResponse.data.user);
        } catch (err) {
          console.log('User not logged in');
        }
      }

      // Fetch featured products and categories
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsAPI.getFeatured({ limit: 8 }),
        categoriesAPI.getAll()
      ]);

      setFeaturedProducts(productsResponse.data.data);
      setCategories(categoriesResponse.data.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      setError('Không thể tải dữ liệu trang chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const handleViewDetail = (product) => {
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (product) => {
    console.log('Thêm vào giỏ hàng:', product);
    // TODO: Add to cart functionality
  };

  //  const handleAddToCart = (product) => {
  //   try {
  //     // Transform product data to match cart item interface
  //     const cartItem = {
  //       id: product._id,
  //       name: product.name,
  //       price: product.price,
  //       image: product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/200x150?text=No+Image',
  //       description: product.description,
  //       category: product.category?.name || 'Uncategorized'
  //     };

  //     addItem(cartItem);
  //     message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  //   } catch (error) {
  //     console.error('Lỗi khi thêm vào giỏ hàng:', error);
  //     message.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
  //   }
  // };

  return (
    <div>
      {/* Hero Section */}
      <Card
        style={{
          marginBottom: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none'
        }}
        bodyStyle={{ padding: '60px 40px', textAlign: 'center' }}
      >
        <ShoppingOutlined style={{ fontSize: 64, marginBottom: 16 }} />
        <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
          Chào mừng đến với Shop Demo
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 32 }}>
          Khám phá hàng ngàn sản phẩm chất lượng với giá cả hợp lý
        </Paragraph>

        {user ? (
          <div>
            <Text style={{ color: 'white', fontSize: 16 }}>
              Xin chào <strong>{user.name}</strong>!
            </Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" size="large" style={{ marginRight: 16 }}>
                Mua sắm ngay
              </Button>
              <Button size="large" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button
              type="primary"
              size="large"
              style={{ marginRight: 16 }}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Row gutter={24} style={{ marginBottom: 40 }}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            onClick={() => navigate('/categories')}
            style={{ height: 120, cursor: 'pointer' }}
            bodyStyle={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            <AppstoreOutlined style={{ fontSize: 48, color: '#1890ff', marginRight: 20 }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>Danh mục sản phẩm</Title>
              <Text type="secondary">Khám phá các danh mục đa dạng</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            onClick={() => navigate('/products')}
            style={{ height: 120, cursor: 'pointer' }}
            bodyStyle={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            <ShoppingOutlined style={{ fontSize: 48, color: '#52c41a', marginRight: 20 }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>Tất cả sản phẩm</Title>
              <Text type="secondary">Xem toàn bộ sản phẩm có sẵn</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <FireOutlined style={{ fontSize: 36, color: '#ff4d4f', marginBottom: 16 }} />
            <Title level={2}>Sản phẩm nổi bật</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Những sản phẩm được yêu thích nhất
            </Text>
          </div>

          <Row gutter={[16, 16]}>
            {featuredProducts.map((product) => (
              <Col
                key={product._id}
                xs={24}
                sm={12}
                md={8}
                lg={6}
                xl={6}
              >
                <ProductCard
                  product={product}
                  onViewDetail={handleViewDetail}
                  onAddToCart={handleAddToCart}
                />
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/products')}
            >
              Xem tất cả sản phẩm
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          style={{ marginTop: 16 }}
        />
      )}

      {/* Feature Demo */}
      <FeatureDemo />
    </div>
  );
};

export default Home;