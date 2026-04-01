import {
    ArrayUnique,
    IsArray,
    IsInt, IsNumber,
    IsObject,
    IsOptional,
    IsString, Matches,
    Max,
    Min, ValidateIf,
} from 'class-validator';
import type { WorkWeek } from './entity';





const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;




export class WorkWindowDto {
    @IsInt()
    @Min(0)
    @Max(1440)
    sMin!: number;

    @IsInt()
    @Min(0)
    @Max(1440)
    eMin!: number;
}

export class CreateWorkMachineCalendarDto {

    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsString()
    name!: string | null;

    @IsOptional()
    @IsString()
    note?: string | null;

    @IsOptional()
    @IsString()
    timezone?: string;


    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsNumber({}, { each: true })
    wcaNos!: number[];

    @IsObject()
    week!: WorkWeek;

    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsString()
    @Matches(YMD_RE)
    dtstart?: string | null;

    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsString()
    @Matches(YMD_RE)
    dtend?: string | null;
}

export class UpdateWorkMachineCalendarDto {
    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsString()
    name?: string | null;

    @IsOptional()
    @IsString()
    note?: string | null;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsNumber({}, { each: true })
    wcaNos?: number[];

    @IsOptional()
    @IsObject()
    week?: WorkWeek;

    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsString()
    @Matches(YMD_RE)
    dtstart?: string | null;

    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsString()
    @Matches(YMD_RE)
    dtend?: string | null;
}

export class WorkMachineCalendarResponseDto {
    id!: number;
    name!: string | null;
    note!: string | null;
    timezone!: string;
    wcaNos!: number[];
    week!: WorkWeek;
    dtstart!: string | null;
    dtend!: string | null;
    createdAt!: string;
    updatedAt!: string;
}