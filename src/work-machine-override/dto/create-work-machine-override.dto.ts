import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Length,
    Min,
} from 'class-validator';

export class CreateWorkMachineOverrideDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    wcaNo!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    typeId!: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    dtstartUtcMs!: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    durationMs!: number;

    @IsOptional()
    @IsString()
    rrule?: string | null;

    @IsOptional()
    @IsString()
    @Length(1, 64)
    timezone?: string;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isEnabled?: boolean;

    @IsOptional()
    @IsString()
    note?: string | null;
}
