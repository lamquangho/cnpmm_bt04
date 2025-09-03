const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const categories = [
    {
        name: 'Điện thoại',
        description: 'Smartphone và điện thoại di động',
        image: 'https://cdn-images.vtv.vn/2019/10/10/photo-1-15706463929181755249740.jpg'
    },
    {
        name: 'Laptop',
        description: 'Máy tính xách tay và phụ kiện',
        image: 'https://cdn-images.vtv.vn/2019/10/10/photo-1-15706463929181755249740.jpg'
    },
    {
        name: 'Thời trang',
        description: 'Quần áo và phụ kiện thời trang',
        image: 'https://res.cloudinary.com/dx8ffnhq3/image/upload/v1756545549/hm8_1_zmytnr.avif'
    },
    {
        name: 'Gia dụng',
        description: 'Đồ gia dụng và thiết bị nhà bếp',
        image: 'https://res.cloudinary.com/dx8ffnhq3/image/upload/v1756545549/hm8_1_zmytnr.avif'
    },
    {
        name: 'Sách',
        description: 'Sách và tài liệu học tập',
        image: 'https://res.cloudinary.com/dx8ffnhq3/image/upload/v1756545549/hm8_1_zmytnr.avif'
    }
];

const generateProducts = (categoryId, categoryName) => {
    const products = [];
    const baseNames = {
        'Điện thoại': ['iPhone 15', 'Samsung Galaxy S24', 'Xiaomi 14', 'OPPO Reno 11', 'Vivo V30'],
        'Laptop': ['MacBook Air M2', 'Dell XPS 13', 'HP Pavilion', 'Lenovo ThinkPad', 'ASUS ZenBook'],
        'Thời trang': ['Áo sơ mi nam', 'Váy maxi nữ', 'Quần jeans', 'Áo hoodie', 'Giày sneaker'],
        'Gia dụng': ['Nồi cơm điện', 'Máy xay sinh tố', 'Bếp từ', 'Tủ lạnh mini', 'Máy lọc nước'],
        'Sách': ['Học lập trình', 'Tâm lý học', 'Kinh tế học', 'Văn học Việt Nam', 'Sách thiếu nhi']
    };

    const names = baseNames[categoryName] || ['Sản phẩm'];

    for (let i = 0; i < 25; i++) {
        const baseName = names[i % names.length];
        const variant = Math.floor(i / names.length) + 1;
        const name = variant > 1 ? `${baseName} ${variant}` : baseName;

        const price = Math.floor(Math.random() * 1000000) + 100000; // 100k - 1M
        const originalPrice = price + Math.floor(Math.random() * 200000); // Giá gốc cao hơn

        products.push({
            name,
            description: `Mô tả chi tiết cho ${name}. Sản phẩm chất lượng cao với nhiều tính năng ưu việt.`,
            price,
            originalPrice,
            category: categoryId,
            images: [
                `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`,
                `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000 + 1)}`
            ],
            stock: Math.floor(Math.random() * 100) + 10,
            featured: Math.random() > 0.8, // 20% chance để là featured
            tags: ['chất lượng cao', 'giá tốt', 'hot'],
            ratings: {
                average: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
                count: Math.floor(Math.random() * 100) + 5
            }
        });
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
