import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';


@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) { }

  async newArrivals() {
    return await this.productModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

}
