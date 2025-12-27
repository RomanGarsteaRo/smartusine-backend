import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCncDto {
    @IsOptional() @IsString() search?: string;   // caută în cncName/cncId
    @IsOptional() @IsString() execution?: string;
    @IsOptional() @Type(() => Number) @IsInt() wcaNo?: number;

    @IsOptional() @Type(() => Number) @IsInt() @Min(0) offset?: number = 0;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 50;
}
