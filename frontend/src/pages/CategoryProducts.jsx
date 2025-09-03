import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Typography, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import ProductList from '../components/ProductList';
import { categoriesAPI } from '../utils/api';

const { Title } = Typography;

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesAPI.getById(categoryId);
      setCategory(response.data.data);
    } catch (err) {
      console.error('Lỗi khi tải thông tin danh mục:', err);
      setError('Không tìm thấy danh mục hoặc có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          Đang tải thông tin danh mục...
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div style={{ padding: '50px 0' }}>
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy danh mục'}
          type="error"
          showIcon
          action={
            <Button onClick={handleBackToCategories}>
              Quay lại danh mục
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Button 
              type="link" 
              icon={<HomeOutlined />} 
              onClick={handleBackToHome}
              style={{ padding: 0 }}
            >
              Trang chủ
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Button 
              type="link" 
              icon={<AppstoreOutlined />} 
              onClick={handleBackToCategories}
              style={{ padding: 0 }}
            >
              Danh mục
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {category.name}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Category Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackToCategories}
            size="large"
          >
            Quay lại danh mục
          </Button>
        </div>
        
        {category.image && (
          <div style={{ marginBottom: 24 }}>
            <img
              src={category.image}
              alt={category.name}
              style={{
                maxWidth: 300,
                height: 150,
                objectFit: 'cover',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        )}
        
        <Title level={1} style={{ margin: 0, color: '#1890ff' }}>
          {category.name}
        </Title>
        
        {category.description && (
          <p style={{ fontSize: 16, color: '#666', marginTop: 8, maxWidth: 600, margin: '8px auto 0' }}>
            {category.description}
          </p>
        )}
      </div>

      {/* Products List */}
      <ProductList 
        categoryId={categoryId} 
        title={`Sản phẩm ${category.name}`}
      />
    </div>
  );
};

export default CategoryProducts;
