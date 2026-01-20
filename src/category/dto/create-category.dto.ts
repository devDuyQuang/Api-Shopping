import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    file?: string;

    @IsOptional()
    @IsBoolean()
    status?: boolean;
}
