import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = Users & Document;

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Users {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, select: false }) // select : false => ẩn password 
    password: string;
    // @Prop({ required: true, select: false })
    // password: string; 
    // find(), findById() → KHÔNG trả password

    @Prop({ default: 'user' })
    role: 'user' | 'admin';

    @Prop()
    fullName: string;

    @Prop({ default: true })
    isActive: boolean;

}

export const UserSchema = SchemaFactory.createForClass(Users);

// mongodb có phải là kiểu dữ liệu quan hệ hay không : có
// tại sao ng ta lại đưa ra kiểu noSql : tại vì cách lưu trữ của nó khác : nó lưu trữ theo dạng json
// dữ liệu của nó là document
