import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }

  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(opts?.page || 1));
    const limitRaw = Number(opts?.limit || 10);
    const limit = Math.min(100, Math.max(1, limitRaw)); // cap 1..100
    const search = (opts?.search || '').trim();

    const filter: any = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { slug: regex }];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort({ createdAt: -1 })  // mới nhất lên trước
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      meta: { page, limit, total, totalPages },
    };
  }

  async findOne(id: string) {
    const doc = await this.categoryModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Category không tồn tại');
    return doc;
  }

  async create(dto: CreateCategoryDto, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }

    const slug = dto.slug?.trim().toLowerCase() || toSlug(dto.name);

    try {
      return await new this.categoryModel({
        ...dto,
        slug,
        createdBy: new Types.ObjectId(userId),
      }).save();
    } catch (e) {
      if (e?.code === 11000) throw new ConflictException('Slug đã tồn tại');
      throw e;
    }
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    const patch: any = { ...dto };
    if (dto.name && !dto.slug) patch.slug = toSlug(dto.name);

    patch.updatedBy = new Types.ObjectId(userId);

    const doc = await this.categoryModel
      .findByIdAndUpdate(id, patch, { new: true, runValidators: true })
      .exec();

    if (!doc) throw new NotFoundException('Category không tồn tại');
    return doc;
  }

  async remove(id: string) {
    const doc = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Category không tồn tại');
    return { message: 'Xoá category thành công' };
  }
}
