import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Alert, Pagination, Switch, Typography, Select, Input, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import ProductCard from './ProductCard';
import { productsAPI } from '../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductList = ({ categoryId, title }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false
  });
  
  // UI controls
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Infinite scroll state
  const [allProducts, setAllProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (page = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: pagination.itemsPerPage,
        sortBy,
        sortOrder,
        ...(searchText && { search: searchText })
      };

      let response;
      if (categoryId) {
        response = await productsAPI.getByCategory(categoryId, params);
      } else {
        response = await productsAPI.getAll(params);
      }

      const { data, pagination: paginationData } = response.data;

      if (append && useInfiniteScroll) {
        setAllProducts(prev => [...prev, ...data]);
        setHasMore(paginationData.hasNextPage);
      } else {
        setProducts(data);
        if (useInfiniteScroll && page === 1) {
          setAllProducts(data);
          setHasMore(paginationData.hasNextPage);
        }
      }

      setPagination(paginationData);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [categoryId, pagination.itemsPerPage, sortBy, sortOrder, searchText, useInfiniteScroll]);

  // Load more for infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && hasMore && useInfiniteScroll) {
      fetchProducts(pagination.currentPage + 1, true);
    }
  }, [fetchProducts, loading, hasMore, useInfiniteScroll, pagination.currentPage]);

  // Infinite scroll effect
  useEffect(() => {
    if (!useInfiniteScroll) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, useInfiniteScroll]);

  // Initial load and when dependencies change
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Switch between pagination and infinite scroll
  const handleModeChange = (checked) => {
    setUseInfiniteScroll(checked);
    if (checked) {
      // Switch to infinite scroll - start fresh
      setAllProducts([]);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    } else {
      // Switch to pagination - keep current data
      setProducts(allProducts.slice(0, pagination.itemsPerPage));
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    if (!useInfiniteScroll) {
      setPagination(prev => ({ ...prev, currentPage: page, itemsPerPage: pageSize }));
      fetchProducts(page, false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleViewDetail = (product) => {
    console.log('Xem chi tiết sản phẩm:', product);
    // TODO: Navigate to product detail page
  };

  const handleAddToCart = (product) => {
    console.log('Thêm vào giỏ hàng:', product);
    // TODO: Add to cart functionality
  };

  const displayProducts = useInfiniteScroll ? allProducts : products;

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {title || 'Tất cả sản phẩm'}
            </Title>
            <Text type="secondary">
              {pagination.totalItems} sản phẩm
            </Text>
          </Col>
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>Infinite Scroll:</span>
              <Switch
                checked={useInfiniteScroll}
                onChange={handleModeChange}
                loading={loading}
              />
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              loading={loading}
            />
          </Col>
          <Col>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(value) => {
                const [field, order] = value.split('-');
                handleSortChange(field, order);
              }}
              style={{ width: 200 }}
              size="large"
            >
              <Option value="createdAt-desc">Mới nhất</Option>
              <Option value="createdAt-asc">Cũ nhất</Option>
              <Option value="price-asc">Giá thấp → cao</Option>
              <Option value="price-desc">Giá cao → thấp</Option>
              <Option value="name-asc">Tên A → Z</Option>
              <Option value="name-desc">Tên Z → A</Option>
              <Option value="ratings.average-desc">Đánh giá cao nhất</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Error */}
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Products Grid */}
      <Row gutter={[16, 16]}>
        {displayProducts.map((product) => (
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

      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">Đang tải sản phẩm...</Text>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!useInfiniteScroll && products.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Pagination
            current={pagination.currentPage}
            total={pagination.totalItems}
            pageSize={pagination.itemsPerPage}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} sản phẩm`
            }
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
            pageSizeOptions={['12', '24', '36', '48']}
          />
        </div>
      )}

      {/* Infinite Scroll End Message */}
      {useInfiniteScroll && !hasMore && allProducts.length > 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Text type="secondary">Đã hiển thị tất cả sản phẩm</Text>
        </div>
      )}
    </div>
  );
};

export default ProductList;
