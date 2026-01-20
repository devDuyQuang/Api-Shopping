import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true, lowercase: true, unique: true })
    slug: string;

    @Prop()
    file: string; // url/path ảnh

    @Prop({ default: true })
    status: boolean;

    // ✅ ai tạo
    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    createdBy: Types.ObjectId;

    // ✅ ai update lần cuối (optional)
    @Prop({ type: Types.ObjectId, ref: 'Users', default: null })
    updatedBy?: Types.ObjectId | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
