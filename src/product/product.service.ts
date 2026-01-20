import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category, CategoryDocument } from 'src/category/schemas/category.schema';

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) { }

  // ✅ LIST + pagination + search
  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(opts?.page ?? 1));
    const limitRaw = Number(opts?.limit ?? 10);
    const limit = Math.min(100, Math.max(1, limitRaw));
    const search = (opts?.search ?? "").trim();
    const skip = (page - 1) * limit;


    const filter: any = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { slug: regex }, { description: regex }];
    }

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("categoryId", "name slug")
        .populate("createdBy", "email fullName role")
        .populate("updatedBy", "email fullName role")
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      meta: { page, limit, total, totalPages },
    };
  }


  async findOne(id: string) {
    const doc = await this.productModel
      .findById(id)
      .populate('categoryId', 'name slug')
      .populate('createdBy', 'email fullName role')
      .populate('updatedBy', 'email fullName role')
      .exec();

    if (!doc) throw new NotFoundException('Product không tồn tại');
    return doc;
  }

  async create(dto: CreateProductDto, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }
    if (!Types.ObjectId.isValid(dto.categoryId)) {
      throw new BadRequestException('categoryId không hợp lệ');
    }

    const categoryExists = await this.categoryModel.findById(dto.categoryId).exec();
    if (!categoryExists) throw new NotFoundException('Category không tồn tại');

    const slug = dto.slug?.trim().toLowerCase() || toSlug(dto.name);

    try {
      return await new this.productModel({
        ...dto,
        slug,
        createdBy: new Types.ObjectId(userId),
      }).save();
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Slug đã tồn tại');
      throw e;
    }
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    const patch: any = { ...dto };

    if (dto.name && !dto.slug) patch.slug = toSlug(dto.name);

    if (dto.categoryId) {
      if (!Types.ObjectId.isValid(dto.categoryId)) {
        throw new BadRequestException('categoryId không hợp lệ');
      }
      const categoryExists = await this.categoryModel.findById(dto.categoryId).exec();
      if (!categoryExists) throw new NotFoundException('Category không tồn tại');
    }

    patch.updatedBy = new Types.ObjectId(userId);

    const doc = await this.productModel
      .findByIdAndUpdate(id, patch, { new: true, runValidators: true })
      .exec();

    if (!doc) throw new NotFoundException('Product không tồn tại');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.productModel.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Product không tồn tại');
    return { message: 'Xoá product thành công' };
  }
}
