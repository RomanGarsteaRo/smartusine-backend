import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Matches, Max, Min, ValidateIf } from 'class-validator';
import type { WorkWeek } from '../entities/week-template.entity';


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
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;



export class CreateWorkUzineCalendarDto {

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsString()
    timezone?: string;

    /**
     * Keys: "0".."6"
     * Values: WorkWindowDto[]
     */
    @IsObject()
    week!: WorkWeek;

    /**
     * "YYYY-MM-DD"
     */
    @IsString()
    @Matches(YMD_RE)
    dtstart!: string;

    /**
     * "YYYY-MM-DD" or omitted => open-ended
     */
    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsString()
    @Matches(YMD_RE)
    dtend?: string;
}

export class UpdateWorkUzineCalendarDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    note?: string | null; // permite null ca să “ștergi” nota

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsObject()
    week?: WorkWeek;

    @IsOptional()
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsString()
    @Matches(YMD_RE)
    dtstart?: string;

    /**
     * string | null:
     *  - string => setează dtend
     *  - null   => devine open-ended
     */
    @IsOptional()
    @ValidateIf((_, v) => v !== undefined) // lăsăm null să treacă până în service
    dtend?: string | null;
}

export class WorkUzineCalendarResponseDto {
    id!: number;
    name!: string;
    note!: string | null;
    timezone!: string;
    week!: WorkWeek;
    dtstart!: string;
    dtend!: string | null;
    createdAt!: string;
    updatedAt!: string;
}