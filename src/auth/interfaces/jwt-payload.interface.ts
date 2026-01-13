// export interface JwtPayload {
//     sub: number;
//     email: string;
//     role?: string;
//     iat?: string;
//     exp?: string;
// }

export interface JwtPayload {
    sub: string;             // userId
    email: string;
    role: 'user' | 'admin';
}
