import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, Alert, Button } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../utils/api';

const { Title, Text } = Typography;
const { Meta } = Card;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
      setError('Không thể tải danh mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải danh mục...</Text>
        </div>
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
        action={
          <Button size="small" onClick={fetchCategories}>
            Thử lại
          </Button>
        }
        style={{ margin: '50px 0' }}
      />
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <AppstoreOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
        <Title level={1}>Danh mục sản phẩm</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Khám phá các danh mục sản phẩm đa dạng của chúng tôi
        </Text>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {categories.map((category) => (
          <Col
            key={category._id}
            xs={24}
            sm={12}
            md={8}
            lg={6}
            xl={6}
          >
            <Card
              hoverable
              cover={
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <img
                    alt={category.name}
                    src={category.image || 'https://via.placeholder.com/300x200/f0f0f0/cccccc?text=Danh+mục'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                </div>
              }
              onClick={() => handleCategoryClick(category._id)}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Meta
                title={
                  <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                    {category.name}
                  </Title>
                }
                description={
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                      {category.description || 'Khám phá ngay'}
                    </Text>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Categories;
