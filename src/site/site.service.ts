// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Product, ProductDocument } from 'src/product/schemas/product.schema';


// @Injectable()
// export class SiteService {
//   constructor(
//     @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
//   ) { }

//   async newArrivals() {
//     return await this.productModel
//       .find()
//       .sort({ createdAt: -1 })
//       .exec();
//   }

// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { Category, CategoryDocument } from 'src/category/schemas/category.schema';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>, // ✅ THÊM
  ) { }

  async newArrivals() {
    return await this.productModel.find().sort({ createdAt: -1 }).exec();
  }

  // câu 1 thầy yêu cầu
  async getCategories() {
    return await this.categoryModel
      .find({ status: true })
      .sort({ createdAt: -1 })
      .select("name slug file status")  // optional: trả về gọn
      .exec();
  }

  // ✅ (2) detail category by slug (public)
  async categoryBySlug(slug: string) {
    const doc = await this.categoryModel
      .findOne({ slug, status: true })
      .select('_id name slug file status')
      .exec();

    if (!doc) {
      throw new NotFoundException('Category không tồn tại');
    }
    return doc;
    // return { success: true, message: 'Success', data: doc, errors: null, statusCode: 200 };
  }
}
