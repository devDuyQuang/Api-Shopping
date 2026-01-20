
// src/users/dto/create-user.dto.ts
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    Matches,
    IsEnum,
    IsOptional,
    IsBoolean,
} from 'class-validator';

export class CreateUserDto {
    //   @IsString()
    //   @IsNotEmpty({ message: 'Tên không được để trống' })
    //   @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
    //   name: string;

    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message:
                'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
        },
    )
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    fullName: string;
    // Optional fields - tùy dự án bạn có thể thêm/bớt
    @IsEnum(['user', 'admin'], { message: 'Role không hợp lệ' })
    @IsOptional()
    role?: 'user' | 'admin' = 'user'; // default 'user'

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}