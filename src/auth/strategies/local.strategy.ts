import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

// passport-local mặc định dùng username/password,
// mình đổi usernameField thành email
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly authService: AuthService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string) {
        const user = await this.authService.validateUser(email, password);
        if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        return user; // gắn vào req.user
    }
}
