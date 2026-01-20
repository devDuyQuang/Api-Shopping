// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class AuthService {}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    // dùng cho LocalStrategy
    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmailWithPassword(email);

        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // trả user "an toàn" (không password)
        return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'user',
            fullName: user.fullName,
        };
    }

    private signAccessToken(payload: JwtPayload) {
        const expiresIn = (this.config.get<string>('JWT_ACCESS_EXPIRES') || '15m') as any;

        return this.jwtService.signAsync(payload as any, {
            secret: this.config.get<string>('JWT_ACCESS_SECRET') || 'access_secret_dev',
            expiresIn,
        });
    }

    private signRefreshToken(payload: JwtPayload) {
        const expiresIn = (this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d') as any;

        return this.jwtService.signAsync(payload as any, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret_dev',
            expiresIn,
        });
    }


    async login(user: { id: string; email: string; role: 'user' | 'admin' }) {
        const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
        const [accessToken, refreshToken] = await Promise.all([
            this.signAccessToken(payload),
            this.signRefreshToken(payload),
        ]);

        return { accessToken, refreshToken };
    }

    async register(dto: RegisterDto) {
        const created = await this.usersService.create(dto as any);

        return {
            id: created._id.toString(),
            email: created.email,
            fullName: created.fullName,
            role: (created as any).role || "user",
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret_dev',
            });

            const accessToken = await this.signAccessToken({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
            });

            return { accessToken };
        } catch {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
    }
}
