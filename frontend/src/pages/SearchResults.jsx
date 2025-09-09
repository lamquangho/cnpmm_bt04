import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Spin, Alert, Typography, Empty, Tag, Divider } from 'antd';
import { SearchOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';
import AdvancedSearch from '../components/AdvancedSearch';
import ProductCard from '../components/ProductCard';
import { searchAPI } from '../utils/api';

const { Title, Text, Paragraph } = Typography;

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchInfo, setSearchInfo] = useState({});
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12
    });

    // Parse URL parameters
    const getFiltersFromURL = () => {
        const params = new URLSearchParams(location.search);
        return {
            q: params.get('q') || '',
            category: params.get('category') || '',
            minPrice: parseFloat(params.get('minPrice')) || 0,
            maxPrice: parseFloat(params.get('maxPrice')) || 10000000,
            brand: params.get('brand') || '',
            hasDiscount: params.get('hasDiscount') === 'true',
            promotionType: params.get('promotionType') || '',
            minRating: parseFloat(params.get('minRating')) || 0,
            sortBy: params.get('sortBy') || 'relevance',
            page: parseInt(params.get('page')) || 1,
            limit: parseInt(params.get('limit')) || 12
        };
    };

    // Update URL with filters
    const updateURL = (filters) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== false && value !== 0 && value !== null && value !== undefined) {
                params.set(key, value.toString());
            }
        });

        const newSearch = params.toString();
        if (newSearch !== location.search.substring(1)) {
            navigate(`/search${newSearch ? '?' + newSearch : ''}`, { replace: true });
        }
    };

    const performSearch = async (filters) => {
        try {
            setLoading(true);
            setError(null);

            const response = await searchAPI.fuzzySearch(filters);

            setProducts(response.data.data);
            setPagination(response.data.pagination);
            setSearchInfo(response.data.searchInfo);

            // Update URL
            updateURL(filters);
        } catch (err) {
            console.error('Lỗi khi tìm kiếm:', err);
            setError('Không thể thực hiện tìm kiếm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Initial search when component mounts or URL changes
    useEffect(() => {
        const filters = getFiltersFromURL();
        if (filters.q || Object.values(filters).some(v => v && v !== 0 && v !== false && v !== '')) {
            performSearch(filters);
        }
    }, [location.search]);

    const handleSearch = (filters) => {
        performSearch({ ...filters, page: 1 });
    };

    const handleViewDetail = async (product) => {
        // Increment view count
        try {
            await searchAPI.incrementView(product._id);
        } catch (error) {
            console.warn('Không thể cập nhật view count:', error);
        }

        console.log('Xem chi tiết sản phẩm:', product);
        // TODO: Navigate to product detail page
    };

    const handleAddToCart = (product) => {
        console.log('Thêm vào giỏ hàng:', product);
        // TODO: Add to cart functionality
    };

    const renderSearchInfo = () => {
        if (!searchInfo.query && products.length === 0) return null;

        return (
            <div style={{ marginBottom: 24, padding: 16, background: '#f6f8fa', borderRadius: 8 }}>
                <Row align="middle" gutter={16}>
                    <Col>
                        <SearchOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    </Col>
                    <Col flex="auto">
                        {searchInfo.query && (
                            <div>
                                <Text strong>Kết quả tìm kiếm cho: </Text>
                                <Tag color="blue" style={{ fontSize: 14 }}>"{searchInfo.query}"</Tag>
                            </div>
                        )}
                        <div style={{ marginTop: 4 }}>
                            <Text type="secondary">
                                Tìm thấy {pagination.totalItems} sản phẩm
                            </Text>
                            {searchInfo.took && (
                                <Text type="secondary" style={{ marginLeft: 16 }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    Thời gian: {searchInfo.took}ms
                                </Text>
                            )}
                            {searchInfo.engine && (
                                <Text type="secondary" style={{ marginLeft: 16 }}>
                                    <ThunderboltOutlined style={{ marginRight: 4 }} />
                                    Engine: {searchInfo.engine}
                                    {searchInfo.fuzzy && <Tag color="green" size="small" style={{ marginLeft: 4 }}>Fuzzy</Tag>}
                                </Text>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderProductHighlight = (product) => {
        if (!product.highlight) return null;

        return (
            <div style={{ marginTop: 8, padding: 8, background: '#fffbe6', borderRadius: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Từ khóa phù hợp:</Text>
                <div style={{ marginTop: 4 }}>
                    {product.highlight.name && (
                        <div dangerouslySetInnerHTML={{ __html: product.highlight.name[0] }} />
                    )}
                    {product.highlight.description && (
                        <div dangerouslySetInnerHTML={{ __html: product.highlight.description[0] }} />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Search Component */}
            <AdvancedSearch
                onSearch={handleSearch}
                initialFilters={getFiltersFromURL()}
            />

            <Divider />

            {/* Search Info */}
            {renderSearchInfo()}

            {/* Error */}
            {error && (
                <Alert
                    message="Lỗi tìm kiếm"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text>Đang tìm kiếm sản phẩm...</Text>
                    </div>
                </div>
            )}

            {/* Results */}
            {!loading && products.length > 0 && (
                <Row gutter={[16, 16]}>
                    {products.map((product) => (
                        <Col
                            key={product._id}
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={6}
                        >
                            <div>
                                <ProductCard
                                    product={product}
                                    onViewDetail={handleViewDetail}
                                    onAddToCart={handleAddToCart}
                                />
                                {renderProductHighlight(product)}
                                {product._score && (
                                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                                        <Tag color="blue" size="small">
                                            Score: {product._score.toFixed(2)}
                                        </Tag>
                                        {product.views > 0 && (
                                            <Tag color="green" size="small">
                                                {product.views} lượt xem
                                            </Tag>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Empty Results */}
            {!loading && products.length === 0 && !error && (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div>
                            <Title level={4}>Không tìm thấy sản phẩm nào</Title>
                            <Paragraph type="secondary">
                                Hãy thử:
                                <ul style={{ textAlign: 'left', marginTop: 16 }}>
                                    <li>Kiểm tra lại từ khóa tìm kiếm</li>
                                    <li>Sử dụng từ khóa khác hoặc chung chung hơn</li>
                                    <li>Xóa bớt các bộ lọc</li>
                                    <li>Thử tìm kiếm sản phẩm tương tự</li>
                                </ul>
                            </Paragraph>
                        </div>
                    }
                />
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && pagination.totalPages > 1 && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Row justify="center">
                        <Col>
                            {/* TODO: Add pagination component */}
                            <Text type="secondary">
                                Trang {pagination.currentPage} / {pagination.totalPages}
                            </Text>
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
