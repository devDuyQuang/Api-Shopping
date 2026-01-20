import 'dotenv/config';
import mongoose from 'mongoose';
import slugify from 'slugify';

import { CategorySchema } from '../category/schemas/category.schema';
import { ProductSchema } from '../product/schemas/product.schema';
import { UserSchema } from '../users/schemas/users.schema';

const CategoryModel = mongoose.model('Category', CategorySchema);
const ProductModel = mongoose.model('Product', ProductSchema);
const UserModel = mongoose.model('User', UserSchema);

async function seedProduct() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected MongoDB Atlas');

    // 1️⃣ XOÁ SẠCH PRODUCT CŨ
    await ProductModel.deleteMany({});
    console.log('🗑 Old products deleted');

    // 2️⃣ LẤY ADMIN
    const admin = await UserModel.findOne({ role: 'admin' });
    if (!admin) {
        throw new Error('❌ Không tìm thấy admin');
    }

    // 3️⃣ LẤY CATEGORY
    const categories = await CategoryModel.find({});
    if (categories.length === 0) {
        throw new Error('❌ Không có category trong DB');
    }

    // 4️⃣ DATA PRODUCT THỰC TẾ
    const productData: Record<string, any[]> = {
        'Áo Thun': [
            {
                name: 'Áo Thun Basic Cotton Form Regular',
                price: 199000,
                description: 'Áo thun cotton mềm mại, thấm hút tốt, dễ phối đồ.',
            },
            {
                name: 'Áo Thun Oversize Streetwear',
                price: 249000,
                description: 'Áo thun form rộng phong cách streetwear trẻ trung.',
            },
            {
                name: 'Áo Thun In Graphic Local Brand',
                price: 279000,
                description: 'Áo thun in hình sắc nét, cá tính.',
            },
            {
                name: 'Áo Thun Trơn Cao Cấp Premium',
                price: 299000,
                description: 'Áo thun trơn chất liệu cao cấp, form đứng.',
            },
            {
                name: 'Áo Thun Unisex Form Rộng',
                price: 259000,
                description: 'Áo thun unisex phù hợp cả nam và nữ.',
            }
        ],

        'Áo Sơ Mi': [
            {
                name: 'Áo Sơ Mi Trắng Công Sở Slimfit',
                price: 349000,
                description: 'Áo sơ mi trắng form slimfit lịch sự.',
            },
            {
                name: 'Áo Sơ Mi Oxford Dài Tay',
                price: 389000,
                description: 'Áo sơ mi vải Oxford dày dặn, ít nhăn.',
            },
            {
                name: 'Áo Sơ Mi Kẻ Caro Casual',
                price: 369000,
                description: 'Áo sơ mi caro phong cách casual.',
            },
            {
                name: 'Áo Sơ Mi Lụa Cao Cấp',
                price: 459000,
                description: 'Áo sơ mi lụa mềm mịn, sang trọng.',
            },
            {
                name: 'Áo Sơ Mi Tay Ngắn Hè',
                price: 329000,
                description: 'Áo sơ mi tay ngắn thoáng mát.',
            }
        ],

        'Quần Jean': [
            {
                name: 'Quần Jean Slimfit Co Giãn',
                price: 499000,
                description: 'Quần jean slimfit co giãn thoải mái.',
            },
            {
                name: 'Quần Jean Ống Suông Unisex',
                price: 529000,
                description: 'Quần jean ống suông phong cách Hàn Quốc.',
            },
            {
                name: 'Quần Jean Rách Gối Street Style',
                price: 559000,
                description: 'Quần jean rách gối cá tính.',
            },
            {
                name: 'Quần Jean Lưng Cao Nữ',
                price: 489000,
                description: 'Quần jean lưng cao tôn dáng.',
            },
            {
                name: 'Quần Jean Wash Nhẹ Vintage',
                price: 519000,
                description: 'Quần jean wash nhẹ phong cách vintage.',
            }
        ],

        'Giày Thể Thao': [
            {
                name: 'Giày Sneaker Trắng Basic',
                price: 799000,
                description: 'Giày sneaker trắng dễ phối đồ.',
            },
            {
                name: 'Giày Sneaker Chunky Đế Cao',
                price: 899000,
                description: 'Giày sneaker chunky cá tính.',
            },
            {
                name: 'Giày Sneaker Cổ Thấp Năng Động',
                price: 759000,
                description: 'Giày sneaker cổ thấp gọn nhẹ.',
            },
            {
                name: 'Giày Sneaker Unisex Hàn Quốc',
                price: 829000,
                description: 'Giày sneaker phong cách Hàn Quốc.',
            },
            {
                name: 'Giày Sneaker Đế Êm Thể Thao',
                price: 879000,
                description: 'Giày sneaker đế êm, phù hợp vận động.',
            }
        ],
    };

    const products: any[] = [];

    for (const category of categories) {
        const items = productData[category.name];
        if (!items) continue;

        for (const item of items) {
            products.push({
                name: item.name,
                slug: slugify(item.name, { lower: true, strict: true }),
                price: item.price,
                description: item.description,
                content: `
${item.name}

✔ Chất liệu cao cấp
✔ Thiết kế hiện đại
✔ Dễ phối đồ
✔ Phù hợp đi làm, đi chơi

Hướng dẫn bảo quản:
- Giặt tay hoặc giặt máy chế độ nhẹ
- Không dùng chất tẩy mạnh
`,
                categoryId: category._id,
                status: true,
                createdBy: admin._id
            });
        }
    }

    await ProductModel.insertMany(products);
    console.log(`🎉 Created ${products.length} products`);

    process.exit(0);
}

seedProduct();
