import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
  ) { }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const email = this.normalizeEmail(createUserDto.email);

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      email,
      password: hashedPassword,
    });

    return await createdUser.save();
  }

  // ✅ phân trang + search
  async findAll(opts?: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(opts?.page ?? 1));
    const limitRaw = Number(opts?.limit ?? 10);
    const limit = Math.min(100, Math.max(1, limitRaw));
    const search = String(opts?.search ?? '').trim();
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ email: regex }, { fullName: regex }, { role: regex }];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Users> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Users> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }
    return { message: `Đã xóa user #${id} thành công` };
  }

  // ✅ dùng cho business bình thường (không cần password)
  async findByEmail(email: string): Promise<Users | null> {
    return this.userModel.findOne({ email: this.normalizeEmail(email) }).exec();
  }

  // ✅ CHỈ dùng cho Auth login (lấy cả password)
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: this.normalizeEmail(email) })
      .select('+password')
      .exec();
  }
}
