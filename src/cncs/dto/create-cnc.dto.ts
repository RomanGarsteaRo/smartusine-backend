import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCncDto {
    @IsInt() wcaNo!: number;
    @IsOptional() @IsString() wcaName?: string;
    @IsOptional() @IsString() cncName?: string;
    @IsOptional() @IsString() activeAxes?: string;
}
