import 'dotenv/config';
import mongoose from 'mongoose';
import slugify from 'slugify';
import * as bcrypt from 'bcrypt';

import { CategorySchema } from '../category/schemas/category.schema';
import { ProductSchema } from '../product/schemas/product.schema';
import { UserSchema } from '../users/schemas/users.schema';

const CategoryModel = mongoose.model('Category', CategorySchema);
const ProductModel = mongoose.model('Product', ProductSchema);
const UserModel = mongoose.model('User', UserSchema);

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected MongoDB Atlas');

    // await CategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
    // await UserModel.deleteMany({});

    // 1️⃣ CREATE ADMIN
    const password = await bcrypt.hash('Test@1234', 10);
    const admin = await UserModel.create({
        fullName: 'Admin',
        email: 'admin@gmail.com',
        password,
        role: 'admin',
        status: true
    });

    console.log('👤 Admin created');

    // 2️⃣ CREATE CATEGORIES
    const categoryNames = [
        'Áo Thun', 'Áo Sơ Mi', 'Quần Jean', 'Quần Tây', 'Giày Thể Thao',
        'Giày Da', 'Váy Nữ', 'Chân Váy', 'Áo Khoác', 'Hoodie',
        'Túi Xách', 'Balo', 'Phụ Kiện', 'Thắt Lưng', 'Ví Da'
    ];

    const categories = await CategoryModel.insertMany(
        categoryNames.map((name, index) => ({
            name,
            slug: slugify(name, { lower: true, strict: true }),
            description: `Danh mục ${name}`,
            image: `https://picsum.photos/400/300?${index + 1}`,
            status: true,
            createdBy: admin._id
        }))
    );

    console.log(`📦 ${categories.length} categories created`);

    // 3️⃣ CREATE 15 PRODUCTS / CATEGORY
    const products: any[] = [];

    for (const category of categories) {
        for (let i = 1; i <= 15; i++) {
            products.push({
                name: `${category.name} Sản Phẩm ${i}`,
                slug: slugify(`${category.name} ${i}`, { lower: true }),
                price: 100000 + i * 10000,
                description: `Mô tả ${category.name} ${i}`,
                content: `Nội dung ${category.name} ${i}`,
                categoryId: category._id,
                status: true,
                createdBy: admin._id
            });
        }
    }

    await ProductModel.insertMany(products);

    console.log(`🎉 ${products.length} products created`);
    process.exit(0);
}

seed();
