import React from 'react';
import { Card, Button, Rate, Typography, Badge } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Text } = Typography;

const ProductCard = ({ product, onViewDetail, onAddToCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const discountPercent = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Badge.Ribbon 
      text={discountPercent > 0 ? `-${discountPercent}%` : ''} 
      color="red"
      style={{ display: discountPercent > 0 ? 'block' : 'none' }}
    >
      <Card
        hoverable
        style={{ width: '100%', marginBottom: 16 }}
        cover={
          <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
            <img
              alt={product.name}
              src={product.images?.[0] || 'https://via.placeholder.com/200x200'}
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
            {product.stock === 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Hết hàng
              </div>
            )}
          </div>
        }
        actions={[
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => onViewDetail?.(product)}
          >
            Xem chi tiết
          </Button>,
          <Button 
            type="text" 
            icon={<ShoppingCartOutlined />} 
            onClick={() => onAddToCart?.(product)}
            disabled={product.stock === 0}
          >
            Thêm giỏ hàng
          </Button>
        ]}
      >
        <Meta
          title={
            <div style={{ height: 48, overflow: 'hidden' }}>
              <Text ellipsis={{ tooltip: product.name }} strong>
                {product.name}
              </Text>
            </div>
          }
          description={
            <div>
              <div style={{ marginBottom: 8, height: 40, overflow: 'hidden' }}>
                <Text type="secondary" ellipsis={{ rows: 2, tooltip: product.description }}>
                  {product.description}
                </Text>
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <Rate disabled defaultValue={product.ratings?.average || 0} size="small" />
                <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                  ({product.ratings?.count || 0})
                </Text>
              </div>
              
              <div style={{ marginBottom: 8 }}>
                <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                  {formatPrice(product.price)}
                </Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text 
                    delete 
                    type="secondary" 
                    style={{ marginLeft: 8, fontSize: '14px' }}
                  >
                    {formatPrice(product.originalPrice)}
                  </Text>
                )}
              </div>
              
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Còn lại: {product.stock}
                </Text>
                {product.featured && (
                  <Badge 
                    count="HOT" 
                    style={{ 
                      backgroundColor: '#52c41a', 
                      marginLeft: 8,
                      fontSize: '10px'
                    }} 
                  />
                )}
              </div>
            </div>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;
