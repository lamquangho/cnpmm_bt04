const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const connectDB = require('./config/db');
const elasticsearchService = require('./services/elasticsearchService');

dotenv.config();

const categories = [
    {
        name: 'Điện thoại',
        description: 'Smartphone và điện thoại di động',
        image: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Điện+thoại'
    },
    {
        name: 'Laptop',
        description: 'Máy tính xách tay và phụ kiện',
        image: 'https://via.placeholder.com/300x200/50C878/FFFFFF?text=Laptop'
    },
    {
        name: 'Thời trang',
        description: 'Quần áo và phụ kiện thời trang',
        image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Thời+trang'
    },
    {
        name: 'Gia dụng',
        description: 'Đồ gia dụng và thiết bị nhà bếp',
        image: 'https://via.placeholder.com/300x200/FFD93D/FFFFFF?text=Gia+dụng'
    },
    {
        name: 'Sách',
        description: 'Sách và tài liệu học tập',
        image: 'https://via.placeholder.com/300x200/9B59B6/FFFFFF?text=Sách'
    }
];

const generateProducts = (categoryId, categoryName) => {
    const products = [];

    // Định nghĩa sản phẩm theo brand cụ thể
    const productsByBrand = {
        'Điện thoại': [
            // Apple products
            { names: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14'], brand: 'Apple' },
            // Samsung products  
            { names: ['Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24+', 'Samsung Galaxy S24', 'Samsung Galaxy A55', 'Samsung Galaxy A35'], brand: 'Samsung' },
            // Xiaomi products
            { names: ['Xiaomi 14 Ultra', 'Xiaomi 14', 'Xiaomi 13T Pro', 'Xiaomi Redmi Note 13', 'Xiaomi Redmi 13'], brand: 'Xiaomi' },
            // OPPO products
            { names: ['OPPO Find X7 Ultra', 'OPPO Reno 11', 'OPPO A78', 'OPPO A58', 'OPPO A18'], brand: 'OPPO' },
            // Vivo products
            { names: ['Vivo V30 Pro', 'Vivo V30', 'Vivo Y36', 'Vivo Y27', 'Vivo Y17s'], brand: 'Vivo' }
        ],
        'Laptop': [
            // Apple products
            { names: ['MacBook Pro M3 16inch', 'MacBook Pro M3 14inch', 'MacBook Air M2 15inch', 'MacBook Air M2 13inch', 'MacBook Air M1'], brand: 'Apple' },
            // Dell products
            { names: ['Dell XPS 15', 'Dell XPS 13', 'Dell Inspiron 15', 'Dell Vostro 15', 'Dell Latitude 14'], brand: 'Dell' },
            // HP products
            { names: ['HP Pavilion 15', 'HP Envy 13', 'HP Spectre x360', 'HP ProBook 450', 'HP EliteBook 840'], brand: 'HP' },
            // Lenovo products
            { names: ['Lenovo ThinkPad X1 Carbon', 'Lenovo IdeaPad 5', 'Lenovo Legion 5', 'Lenovo Yoga Slim 7', 'Lenovo ThinkBook 15'], brand: 'Lenovo' },
            // ASUS products
            { names: ['ASUS ZenBook 14', 'ASUS VivoBook 15', 'ASUS ROG Strix G15', 'ASUS TUF Gaming A15', 'ASUS ExpertBook B1'], brand: 'ASUS' }
        ],
        'Thời trang': [
            // Zara products
            { names: ['Zara Áo sơ mi Oxford', 'Zara Quần jeans Slim', 'Zara Áo blazer nữ', 'Zara Váy midi', 'Zara Áo len nam'], brand: 'Zara' },
            // H&M products
            { names: ['H&M Áo thun basic', 'H&M Quần short kaki', 'H&M Váy maxi hoa', 'H&M Áo hoodie unisex', 'H&M Quần jogger'], brand: 'H&M' },
            // Uniqlo products
            { names: ['Uniqlo Áo polo nam', 'Uniqlo Quần chinos', 'Uniqlo Áo cardigan nữ', 'Uniqlo Váy xếp ly', 'Uniqlo Áo khoác puffer'], brand: 'Uniqlo' },
            // Nike products
            { names: ['Nike Air Force 1', 'Nike Air Max 270', 'Nike Dri-FIT áo thể thao', 'Nike Shorts chạy bộ', 'Nike Áo khoác gió'], brand: 'Nike' },
            // Adidas products
            { names: ['Adidas Stan Smith', 'Adidas Ultraboost 22', 'Adidas 3-Stripes áo polo', 'Adidas Quần track', 'Adidas Áo khoác bomber'], brand: 'Adidas' }
        ],
        'Gia dụng': [
            // Panasonic products
            { names: ['Panasonic Nồi cơm điện 1.8L', 'Panasonic Máy xay sinh tố', 'Panasonic Lò vi sóng 25L', 'Panasonic Quạt đứng', 'Panasonic Bình đun siêu tốc'], brand: 'Panasonic' },
            // Sharp products
            { names: ['Sharp Tủ lạnh Inverter 240L', 'Sharp Máy giặt 8kg', 'Sharp Điều hòa 1HP', 'Sharp Lò nướng 42L', 'Sharp Máy lọc không khí'], brand: 'Sharp' },
            // Electrolux products
            { names: ['Electrolux Máy hút bụi', 'Electrolux Bếp từ đôi', 'Electrolux Máy rửa chén', 'Electrolux Máy sấy tóc', 'Electrolux Nồi chiên không dầu'], brand: 'Electrolux' },
            // Sunhouse products
            { names: ['Sunhouse Bàn ủi hơi nước', 'Sunhouse Máy ép trái cây', 'Sunhouse Nồi áp suất', 'Sunhouse Máy làm bánh mì', 'Sunhouse Ấm đun nước inox'], brand: 'Sunhouse' },
            // Philips products
            { names: ['Philips Máy lọc nước RO', 'Philips Máy cạo râu', 'Philips Bóng đèn LED', 'Philips Máy pha cà phê', 'Philips Máy massage'], brand: 'Philips' }
        ],
        'Sách': [
            // NXB Trẻ products
            { names: ['Đắc Nhân Tâm', 'Nhà Giả Kim', 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Cây Cam Ngọt Của Tôi', 'Café Cùng Tony'], brand: 'NXB Trẻ' },
            // Alpha Books products
            { names: ['Tâm Lý Học Tội Phạm', 'Kinh Tế Học Vi Mô', 'Lập Trình Python Cơ Bản', 'Marketing 4.0', 'Quản Trị Nhân Sự'], brand: 'Alpha Books' },
            // Kim Đồng products
            { names: ['Doraemon Tập 1', 'Conan Thám Tử Lừng Danh', 'One Piece Tập 100', 'Truyện Kiều', 'Sách Thiếu Nhi Hay'], brand: 'NXB Kim Đồng' },
            // First News products
            { names: ['Sapiens Lược Sử Loài Người', 'Homo Deus', 'Thinking Fast and Slow', 'The Lean Startup', 'Rich Dad Poor Dad'], brand: 'First News' },
            // Thế Giới products
            { names: ['Văn Học Việt Nam Đương Đại', 'Lịch Sử Việt Nam', 'Triết Học Phương Đông', 'Kinh Tế Chính Trị', 'Xã Hội Học Đại Cương'], brand: 'NXB Thế Giới' }
        ]
    };

    const promotionTypes = ['sale', 'new', 'hot', 'bestseller', 'limited'];
    const brandGroups = productsByBrand[categoryName] || [{ names: ['Sản phẩm'], brand: 'Generic' }];

    let productCount = 0;

    // Tạo sản phẩm cho mỗi brand
    for (const brandGroup of brandGroups) {
        for (let i = 0; i < brandGroup.names.length && productCount < 25; i++) {
            const name = brandGroup.names[i];
            const brand = brandGroup.brand;

            const price = Math.floor(Math.random() * 1000000) + 100000; // 100k - 1M
            const originalPrice = price + Math.floor(Math.random() * 200000); // Giá gốc cao hơn

            // Random discount (regular price reduction)
            const hasDiscount = Math.random() > 0.7; // 30% có discount thường
            const discountPercentage = hasDiscount ? Math.floor(Math.random() * 25) + 5 : 0; // 5-30%

            // Random promotion (special campaigns)
            const hasPromotion = Math.random() > 0.6; // 40% có promotion campaigns
            const promotionTypes = [
                { type: 'flash_sale', label: 'Flash Sale', percentage: [50, 70] },
                { type: 'clearance', label: 'Thanh lý', percentage: [30, 60] },
                { type: 'new_arrival', label: 'Hàng mới về', percentage: [10, 25] },
                { type: 'bestseller', label: 'Bán chạy', percentage: [15, 30] },
                { type: 'limited_edition', label: 'Phiên bản giới hạn', percentage: [20, 40] }
            ];

            const promotionData = hasPromotion ? promotionTypes[Math.floor(Math.random() * promotionTypes.length)] : null;
            const promotionPercentage = promotionData ?
                Math.floor(Math.random() * (promotionData.percentage[1] - promotionData.percentage[0] + 1)) + promotionData.percentage[0] : 0;

            // Search keywords phù hợp
            const searchKeywords = [
                categoryName.toLowerCase(),
                name.toLowerCase(),
                brand.toLowerCase(),
                ...name.toLowerCase().split(' ')
            ];

            // Generate SKU theo brand
            const sku = `${brand.substring(0, 3).toUpperCase()}-${categoryName.substring(0, 3).toUpperCase()}-${Date.now()}-${productCount}`;

            products.push({
                name,
                description: `${name} chính hãng ${brand}. Sản phẩm chất lượng cao với thiết kế tinh tế, hiệu năng vượt trội. Bảo hành chính hãng, giao hàng toàn quốc.`,
                price,
                originalPrice,
                category: categoryId,
                brand,
                sku,
                images: [
                    `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
                    `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000 + 1)}`
                ],
                stock: Math.floor(Math.random() * 100) + 10,
                featured: Math.random() > 0.8, // 20% chance để là featured
                tags: ['chính hãng', brand.toLowerCase(), 'chất lượng cao', 'bán chạy'],
                searchKeywords,
                views: Math.floor(Math.random() * 1000) + 50, // 50-1050 views
                weight: Math.random() * 5 + 0.1, // 0.1 - 5.1 kg
                dimensions: {
                    length: Math.floor(Math.random() * 50) + 10,
                    width: Math.floor(Math.random() * 40) + 10,
                    height: Math.floor(Math.random() * 30) + 5
                },
                discount: {
                    percentage: discountPercentage,
                    isActive: hasDiscount,
                    startDate: hasDiscount ? new Date() : null,
                    endDate: hasDiscount ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days
                    reason: hasDiscount ? 'Giảm giá thường xuyên' : undefined
                },
                promotion: {
                    ...(hasPromotion && {
                        type: promotionData.type,
                        label: promotionData.label,
                        percentage: promotionPercentage,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
                    }),
                    isActive: hasPromotion,
                    priority: hasPromotion ? Math.floor(Math.random() * 10) + 1 : 0
                },
                ratings: {
                    average: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
                    count: Math.floor(Math.random() * 100) + 5
                }
            });

            productCount++;
        }
    }

    return products;
};

const seedData = async () => {
    try {
        await connectDB();

        // Xóa dữ liệu cũ
        console.log('Đang xóa dữ liệu cũ...');
        await Product.deleteMany({});
        await Category.deleteMany({});

        // Thêm categories
        console.log('Đang thêm categories...');
        const createdCategories = await Category.insertMany(categories);
        console.log(`Đã thêm ${createdCategories.length} categories`);

        // Thêm products
        console.log('Đang thêm products...');
        let allProducts = [];

        for (const category of createdCategories) {
            const products = generateProducts(category._id, category.name);
            allProducts = [...allProducts, ...products];
        }

        const createdProducts = await Product.insertMany(allProducts);
        console.log(`Đã thêm ${createdProducts.length} products`);

        // Index vào Elasticsearch (nếu có)
        try {
            console.log('Đang setup Elasticsearch...');
            await elasticsearchService.createIndex();
            await elasticsearchService.indexAllProducts();
            console.log('Elasticsearch indexing hoàn thành!');
        } catch (elasticError) {
            console.warn('Elasticsearch không khả dụng:', elasticError.message);
            console.log('Dữ liệu vẫn có sẵn trong MongoDB');
        }

        console.log('Seed data hoàn thành!');
        process.exit(0);
    } catch (error) {
        console.error('Lỗi khi seed data:', error);
        process.exit(1);
    }
};

// Chạy seed nếu file được chạy trực tiếp
if (require.main === module) {
    seedData();
}

module.exports = seedData;