import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ required: true })
    price: number;

    @Prop()
    description?: string;

    @Prop()
    content?: string;

    @Prop({ default: 0 })
    view: number;

    @Prop({ default: 0 })
    like: number;

    // categoryId (FK tới category)
    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: Types.ObjectId;

    // AI TẠO
    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    createdBy: Types.ObjectId;

    // AI UPDATE (lần cuối)
    @Prop({ type: Types.ObjectId, ref: 'Users', default: null })
    updatedBy?: Types.ObjectId | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
