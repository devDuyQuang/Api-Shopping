import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsMongoId()
    categoryId: string;
}
