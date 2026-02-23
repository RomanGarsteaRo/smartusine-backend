import {
    ArrayMaxSize,
    IsArray, IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OverrideEffect } from '../entities/work-override.entity';





export class CreateUzineOverrideTypeDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEnum(OverrideEffect)
    effect!: OverrideEffect;
}



export class UpsertUzineOverrideDto {
    /** dacă vine, TypeORM save() face update; altfel insert */
    @IsOptional()
    @IsInt()
    @Min(1)
    id?: number;

    @IsInt()
    @Min(1)
    typeId!: number;

    /** epoch ms (ABS) */
    @IsInt()
    @Min(0)
    startAbsMs!: number;

    /** epoch ms (ABS) */
    @IsInt()
    @Min(0)
    endAbsMs!: number;

    @IsOptional()
    @IsString()
    name?: string | null;

    @IsOptional()
    @IsString()
    note?: string | null;
}

export class UpsertUzineOverrideBatchDto {
    @IsArray()
    @ArrayMaxSize(300)
    @ValidateNested({ each: true })
    @Type(() => UpsertUzineOverrideDto)
    items!: UpsertUzineOverrideDto[];
}