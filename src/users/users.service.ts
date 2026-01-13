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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private userModel: Model<UserDocument>,
  ) { }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const email = this.normalizeEmail(createUserDto.email);

    // 1) kiểm tra email đã tồn tại chưa (theo đúng ý bạn)
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    // 2) tạo user
    try {
      const createdUser = new this.userModel({
        ...createUserDto,
        email,
      });
      return await createdUser.save();
    } catch (error) {
      // 3) chống race condition (2 request tới cùng lúc)
      if (error?.code === 11000) {
        throw new ConflictException('Email này đã được sử dụng');
      }
      throw error;
    }
  }

  async findAll(): Promise<Users[]> {
    // password đã select:false trong schema => tự ẩn
    return this.userModel.find().exec();
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
