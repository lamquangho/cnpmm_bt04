import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    Input,
    Select,
    Slider,
    Switch,
    Button,
    Form,
    Space,
    Typography,
    Collapse,
    Rate,
    AutoComplete,
    Badge
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
    DownOutlined
} from '@ant-design/icons';
import { searchAPI } from '../utils/api';
import { debounce } from 'lodash';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const AdvancedSearch = ({ onSearch, onFiltersChange, initialFilters = {} }) => {
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({
        q: '',
        category: '',
        minPrice: 0,
        maxPrice: 10000000,
        brand: '',
        hasDiscount: false,
        hasPromotion: false,
        promotionType: '',
        minViews: 0,
        minRating: 0,
        sortBy: 'relevance',
        ...initialFilters
    });

    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        brands: [],
        priceRange: { minPrice: 0, maxPrice: 10000000 },
        promotions: [],
        viewsRange: { minViews: 0, maxViews: 1000 },
        discountOptions: [],
        promotionOptions: [],
        ratingOptions: [],
        viewsOptions: []
    });

    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Load filter options
    useEffect(() => {
        loadFilterOptions();
    }, []);

    // Update filters when initialFilters change
    useEffect(() => {
        if (Object.keys(initialFilters).length > 0) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
            form.setFieldsValue(initialFilters);
        }
    }, [initialFilters, form]);

    const loadFilterOptions = async () => {
        try {
            const response = await searchAPI.getFilterOptions();
            setFilterOptions(response.data.data);

            // Update price range in filters
            const { minPrice, maxPrice } = response.data.data.priceRange;
            setFilters(prev => ({
                ...prev,
                minPrice: prev.minPrice === 0 ? minPrice : prev.minPrice,
                maxPrice: prev.maxPrice === 10000000 ? maxPrice : prev.maxPrice
            }));
        } catch (error) {
            console.error('Lỗi khi load filter options:', error);
        }
    };

    // Debounced search suggestions
    const getSuggestions = useCallback(
        debounce(async (query) => {
            if (!query || query.length < 2) {
                setSuggestions([]);
                return;
            }

            try {
                const response = await searchAPI.getSuggestions({ q: query, limit: 8 });
                const suggestionOptions = response.data.data.map((item, index) => ({
                    key: index,
                    value: item.text,
                    label: item.text
                }));
                setSuggestions(suggestionOptions);
            } catch (error) {
                console.error('Lỗi khi lấy suggestions:', error);
                setSuggestions([]);
            }
        }, 300),
        []
    );

    const handleSearch = (values = filters) => {
        const searchParams = { ...filters, ...values };
        setFilters(searchParams);
        onSearch?.(searchParams);
        onFiltersChange?.(searchParams);
    };

    const handleFieldChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        form.setFieldsValue({ [field]: value });

        // Auto search for some fields
        if (['category', 'hasDiscount', 'hasPromotion', 'promotionType', 'minViews', 'minRating', 'sortBy'].includes(field)) {
            handleSearch(newFilters);
        }
    };

    const handleQueryChange = (value) => {
        setFilters(prev => ({ ...prev, q: value }));
        getSuggestions(value);
    };

    const handlePriceChange = (range) => {
        const [minPrice, maxPrice] = range;
        const newFilters = { ...filters, minPrice, maxPrice };
        setFilters(newFilters);
        form.setFieldsValue({ priceRange: range });
    };

    const handleClearFilters = () => {
        const defaultFilters = {
            q: '',
            category: '',
            minPrice: filterOptions.priceRange.minPrice,
            maxPrice: filterOptions.priceRange.maxPrice,
            brand: '',
            hasDiscount: false,
            hasPromotion: false,
            promotionType: '',
            minViews: 0,
            minRating: 0,
            sortBy: 'relevance'
        };

        setFilters(defaultFilters);
        form.setFieldsValue({
            ...defaultFilters,
            priceRange: [defaultFilters.minPrice, defaultFilters.maxPrice]
        });
        handleSearch(defaultFilters);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.q) count++;
        if (filters.category) count++;
        if (filters.brand) count++;
        if (filters.hasDiscount) count++;
        if (filters.hasPromotion) count++;
        if (filters.promotionType) count++;
        if (filters.minViews > 0) count++;
        if (filters.minRating > 0) count++;
        if (filters.minPrice > filterOptions.priceRange.minPrice || filters.maxPrice < filterOptions.priceRange.maxPrice) count++;
        return count;
    };

    return (
        <Card>
            {/* Search Bar */}
            <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                <Col flex="auto">
                    <AutoComplete
                        size="large"
                        options={suggestions}
                        onSearch={handleQueryChange}
                        onSelect={(value) => {
                            setFilters(prev => ({ ...prev, q: value }));
                            handleSearch({ ...filters, q: value });
                        }}
                        value={filters.q}
                    >
                        <Input.Search
                            placeholder="Tìm kiếm sản phẩm... (hỗ trợ tìm kiếm mờ)"
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={(value) => handleSearch({ ...filters, q: value })}
                            loading={loading}
                        />
                    </AutoComplete>
                </Col>

                <Col>
                    <Space>
                        <Badge count={getActiveFiltersCount()} showZero={false}>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setFiltersVisible(!filtersVisible)}
                                type={filtersVisible ? 'primary' : 'default'}
                            >
                                Bộ lọc
                            </Button>
                        </Badge>

                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                            disabled={getActiveFiltersCount() === 0}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Quick Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                    <Text type="secondary">Sắp xếp:</Text>
                </Col>
                <Col flex="auto">
                    <Select
                        value={filters.sortBy}
                        onChange={(value) => handleFieldChange('sortBy', value)}
                        style={{ width: 200 }}
                    >
                        <Option value="relevance">Liên quan nhất</Option>
                        <Option value="newest">Mới nhất</Option>
                        <Option value="price_asc">Giá thấp → cao</Option>
                        <Option value="price_desc">Giá cao → thấp</Option>
                        <Option value="views">Xem nhiều nhất</Option>
                        <Option value="rating">Đánh giá cao nhất</Option>
                        <Option value="name_asc">Tên A → Z</Option>
                        <Option value="name_desc">Tên Z → A</Option>
                    </Select>
                </Col>
            </Row>

            {/* Advanced Filters */}
            {filtersVisible && (
                <Collapse ghost>
                    <Panel header="Bộ lọc nâng cao" key="1" extra={<DownOutlined />}>
                        <Form form={form} layout="vertical" onFinish={handleSearch}>
                            <Row gutter={24}>
                                {/* Category Filter */}
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Danh mục" name="category">
                                        <Select
                                            placeholder="Chọn danh mục"
                                            allowClear
                                            value={filters.category}
                                            onChange={(value) => handleFieldChange('category', value || '')}
                                        >
                                            {filterOptions.categories.map(cat => (
                                                <Option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                {/* Brand Filter */}
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Thương hiệu" name="brand">
                                        <Select
                                            placeholder="Chọn thương hiệu"
                                            allowClear
                                            showSearch
                                            value={filters.brand}
                                            onChange={(value) => handleFieldChange('brand', value || '')}
                                        >
                                            {filterOptions.brands.map(brand => (
                                                <Option key={brand.brand} value={brand.brand}>
                                                    {brand.brand} ({brand.count})
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                {/* Promotion Type Filter */}
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Chương trình KM" name="promotionType">
                                        <Select
                                            placeholder="Loại chương trình"
                                            allowClear
                                            value={filters.promotionType}
                                            onChange={(value) => handleFieldChange('promotionType', value || '')}
                                        >
                                            {filterOptions.promotions.map(promo => (
                                                <Option key={promo.type} value={promo.type}>
                                                    {promo.label} ({promo.count}) - {promo.avgPercentage}%
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                {/* Views Filter */}
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item label="Lượt xem tối thiểu" name="minViews">
                                        <Select
                                            value={filters.minViews}
                                            onChange={(value) => handleFieldChange('minViews', value)}
                                        >
                                            {filterOptions.viewsOptions.map(option => (
                                                <Option key={option.value} value={option.value}>
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                {/* Discount Switch */}
                                {/*
                                <Col xs={24} sm={8}>
                                    <Form.Item label="Giảm giá thường" name="hasDiscount">
                                        <Switch
                                            checked={filters.hasDiscount}
                                            onChange={(checked) => handleFieldChange('hasDiscount', checked)}
                                            checkedChildren="Có"
                                            unCheckedChildren="Không"
                                        />
                                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                            Giảm giá định kỳ của cửa hàng
                                        </div>
                                    </Form.Item>
                                </Col>

                                {/* Promotion Switch *
                                <Col xs={24} sm={8}>
                                    <Form.Item label="Chương trình KM" name="hasPromotion">
                                        <Switch
                                            checked={filters.hasPromotion}
                                            onChange={(checked) => handleFieldChange('hasPromotion', checked)}
                                            checkedChildren="Có"
                                            unCheckedChildren="Không"
                                        />
                                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                            Flash Sale, Thanh lý, v.v.
                                        </div>
                                    </Form.Item>
                                </Col>
                                */}

                                {/* Rating Filter */}
                                <Col xs={24} sm={8}>
                                    <Form.Item label="Đánh giá tối thiểu" name="minRating">
                                        <div>
                                            <Rate
                                                value={filters.minRating}
                                                onChange={(value) => handleFieldChange('minRating', value)}
                                                allowClear
                                                size="small"
                                            />
                                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                                {filters.minRating > 0 ? `${filters.minRating} sao+` : 'Tất cả'}
                                            </Text>
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                {/* Price Range */}
                                <Col xs={24} md={24}>
                                    <Form.Item label={`Khoảng giá: ${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`} name="priceRange">
                                        <Slider
                                            range
                                            min={filterOptions.priceRange.minPrice}
                                            max={filterOptions.priceRange.maxPrice}
                                            value={[filters.minPrice, filters.maxPrice]}
                                            onChange={handlePriceChange}
                                            onAfterChange={() => handleSearch()}
                                            tipFormatter={(value) => formatPrice(value)}
                                            step={50000}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row justify="end">
                                <Col>
                                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                        Áp dụng bộ lọc
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Panel>
                </Collapse>
            )}
        </Card>
    );
};

export default AdvancedSearch;
