const { client } = require('../config/elasticsearch');
const Product = require('../models/Product');

const INDEX_NAME = 'products';

class ElasticsearchService {
    // Tạo index với mapping
    async createIndex() {
        try {
            const exists = await client.indices.exists({ index: INDEX_NAME });

            if (!exists) {
                await client.indices.create({
                    index: INDEX_NAME,
                    body: {
                        settings: {
                            analysis: {
                                analyzer: {
                                    vietnamese_analyzer: {
                                        type: 'custom',
                                        tokenizer: 'standard',
                                        filter: ['lowercase', 'asciifolding']
                                    }
                                }
                            }
                        },
                        mappings: {
                            properties: {
                                name: {
                                    type: 'text',
                                    analyzer: 'vietnamese_analyzer',
                                    fields: {
                                        keyword: { type: 'keyword' },
                                        suggest: {
                                            type: 'completion',
                                            analyzer: 'vietnamese_analyzer'
                                        }
                                    }
                                },
                                description: {
                                    type: 'text',
                                    analyzer: 'vietnamese_analyzer'
                                },
                                price: { type: 'double' },
                                originalPrice: { type: 'double' },
                                category: {
                                    type: 'object',
                                    properties: {
                                        _id: { type: 'keyword' },
                                        name: {
                                            type: 'text',
                                            analyzer: 'vietnamese_analyzer',
                                            fields: { keyword: { type: 'keyword' } }
                                        }
                                    }
                                },
                                brand: {
                                    type: 'text',
                                    analyzer: 'vietnamese_analyzer',
                                    fields: { keyword: { type: 'keyword' } }
                                },
                                tags: {
                                    type: 'text',
                                    analyzer: 'vietnamese_analyzer',
                                    fields: { keyword: { type: 'keyword' } }
                                },
                                searchKeywords: {
                                    type: 'text',
                                    analyzer: 'vietnamese_analyzer'
                                },
                                views: { type: 'integer' },
                                stock: { type: 'integer' },
                                featured: { type: 'boolean' },
                                isActive: { type: 'boolean' },
                                discount: {
                                    type: 'object',
                                    properties: {
                                        percentage: { type: 'integer' },
                                        isActive: { type: 'boolean' },
                                        startDate: { type: 'date' },
                                        endDate: { type: 'date' }
                                    }
                                },
                                promotion: {
                                    type: 'object',
                                    properties: {
                                        type: { type: 'keyword' },
                                        isActive: { type: 'boolean' },
                                        priority: { type: 'integer' }
                                    }
                                },
                                ratings: {
                                    type: 'object',
                                    properties: {
                                        average: { type: 'float' },
                                        count: { type: 'integer' }
                                    }
                                },
                                createdAt: { type: 'date' },
                                updatedAt: { type: 'date' }
                            }
                        }
                    }
                });
                console.log(`Index ${INDEX_NAME} được tạo thành công`);
            }
        } catch (error) {
            console.error('Lỗi khi tạo index:', error);
            throw error;
        }
    }

    // Index một sản phẩm
    async indexProduct(product) {
        try {
            await client.index({
                index: INDEX_NAME,
                id: product._id.toString(),
                body: {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    category: product.category,
                    brand: product.brand,
                    tags: product.tags,
                    searchKeywords: product.searchKeywords,
                    views: product.views || 0,
                    stock: product.stock,
                    featured: product.featured,
                    isActive: product.isActive,
                    discount: product.discount,
                    promotion: product.promotion,
                    ratings: product.ratings,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                }
            });
        } catch (error) {
            console.error('Lỗi khi index sản phẩm:', error);
            throw error;
        }
    }

    // Index tất cả sản phẩm từ MongoDB
    async indexAllProducts() {
        try {
            const products = await Product.find({ isActive: true }).populate('category');
            const bulk = [];

            for (const product of products) {
                bulk.push({ index: { _index: INDEX_NAME, _id: product._id.toString() } });
                bulk.push({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    category: product.category,
                    brand: product.brand,
                    tags: product.tags,
                    searchKeywords: product.searchKeywords,
                    views: product.views || 0,
                    stock: product.stock,
                    featured: product.featured,
                    isActive: product.isActive,
                    discount: product.discount,
                    promotion: product.promotion,
                    ratings: product.ratings,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                });
            }

            if (bulk.length > 0) {
                const response = await client.bulk({ body: bulk });
                console.log(`Đã index ${products.length} sản phẩm vào Elasticsearch`);

                if (response.errors) {
                    console.error('Có lỗi trong quá trình bulk index:', response.errors);
                }
            }
        } catch (error) {
            console.error('Lỗi khi index tất cả sản phẩm:', error);
            throw error;
        }
    }

    // Fuzzy search với advanced filters
    async searchProducts(params) {
        const {
            query = '',
            category = '',
            minPrice = 0,
            maxPrice = 999999999,
            brand = '',
            hasDiscount = false,
            promotionType = '',
            minRating = 0,
            sortBy = 'relevance',
            page = 1,
            limit = 12
        } = params;

        const from = (page - 1) * limit;

        // Xây dựng Elasticsearch query
        const searchQuery = {
            index: INDEX_NAME,
            body: {
                from,
                size: limit,
                query: {
                    bool: {
                        must: [
                            { term: { isActive: true } }
                        ],
                        filter: [],
                        should: [],
                        minimum_should_match: 0
                    }
                }
            }
        };

        // Fuzzy search cho text
        if (query) {
            searchQuery.body.query.bool.should.push(
                {
                    multi_match: {
                        query: query,
                        fields: ['name^3', 'description^2', 'searchKeywords^2', 'brand', 'tags'],
                        fuzziness: 'AUTO',
                        operator: 'or',
                        boost: 2
                    }
                },
                {
                    match_phrase_prefix: {
                        name: {
                            query: query,
                            boost: 3
                        }
                    }
                },
                {
                    wildcard: {
                        'name.keyword': {
                            value: `*${query.toLowerCase()}*`,
                            boost: 1.5
                        }
                    }
                }
            );
            searchQuery.body.query.bool.minimum_should_match = 1;
        }

        // Filter theo category
        if (category) {
            searchQuery.body.query.bool.filter.push({
                term: { 'category._id': category }
            });
        }

        // Filter theo giá
        searchQuery.body.query.bool.filter.push({
            range: {
                price: {
                    gte: minPrice,
                    lte: maxPrice
                }
            }
        });

        // Filter theo brand
        if (brand) {
            searchQuery.body.query.bool.filter.push({
                term: { 'brand.keyword': brand }
            });
        }

        // Filter theo discount
        if (hasDiscount) {
            searchQuery.body.query.bool.filter.push({
                term: { 'discount.isActive': true }
            });
        }

        // Filter theo promotion type
        if (promotionType) {
            searchQuery.body.query.bool.filter.push({
                bool: {
                    must: [
                        { term: { 'promotion.isActive': true } },
                        { term: { 'promotion.type': promotionType } }
                    ]
                }
            });
        }

        // Filter theo rating
        if (minRating > 0) {
            searchQuery.body.query.bool.filter.push({
                range: {
                    'ratings.average': {
                        gte: minRating
                    }
                }
            });
        }

        // Sorting
        const sortOptions = {
            relevance: [],
            price_asc: [{ price: { order: 'asc' } }],
            price_desc: [{ price: { order: 'desc' } }],
            newest: [{ createdAt: { order: 'desc' } }],
            oldest: [{ createdAt: { order: 'asc' } }],
            views: [{ views: { order: 'desc' } }],
            rating: [{ 'ratings.average': { order: 'desc' } }],
            name_asc: [{ 'name.keyword': { order: 'asc' } }],
            name_desc: [{ 'name.keyword': { order: 'desc' } }]
        };

        if (sortOptions[sortBy]) {
            searchQuery.body.sort = sortOptions[sortBy];
        }

        // Highlight để show matched text
        searchQuery.body.highlight = {
            fields: {
                name: {},
                description: {}
            },
            pre_tags: ['<mark>'],
            post_tags: ['</mark>']
        };

        try {
            const response = await client.search(searchQuery);

            const products = response.body.hits.hits.map(hit => ({
                ...hit._source,
                _id: hit._id,
                _score: hit._score,
                highlight: hit.highlight
            }));

            return {
                products,
                total: response.body.hits.total.value,
                took: response.body.took,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(response.body.hits.total.value / limit),
                    totalItems: response.body.hits.total.value,
                    itemsPerPage: limit
                }
            };
        } catch (error) {
            console.error('Lỗi Elasticsearch search:', error);
            throw error;
        }
    }

    // Gợi ý tự động hoàn thành
    async getSuggestions(query, limit = 5) {
        try {
            const response = await client.search({
                index: INDEX_NAME,
                body: {
                    suggest: {
                        product_suggest: {
                            prefix: query,
                            completion: {
                                field: 'name.suggest',
                                size: limit
                            }
                        }
                    }
                }
            });

            return response.body.suggest.product_suggest[0].options.map(option => ({
                text: option.text,
                score: option._score
            }));
        } catch (error) {
            console.error('Lỗi get suggestions:', error);
            throw error;
        }
    }

    // Xóa index
    async deleteIndex() {
        try {
            await client.indices.delete({ index: INDEX_NAME });
            console.log(`Index ${INDEX_NAME} đã được xóa`);
        } catch (error) {
            console.error('Lỗi khi xóa index:', error);
        }
    }
}

module.exports = new ElasticsearchService();
