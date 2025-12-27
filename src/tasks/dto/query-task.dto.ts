/* query-task.dto.ts */

// Pentru filtrare + paginare
import { IsInt, IsISO8601, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTaskDto {
    @IsOptional() @IsString() search?: string;       // caută în jobNo/clientName
    @IsOptional() @IsInt() @Type(() => Number) status?: number;
    @IsOptional() @IsString() clientName?: string;
    @IsOptional() @IsString() jobNo?: string;

    /* For one single WCA */
    @IsOptional() @IsInt() @Type(() => Number) wcaNo?: number;
    /* WCA list (from the query as a string "10072,10075") */
    @IsOptional() @IsString() wcaNos?: string;

    @IsOptional() @IsISO8601() startFrom?: string;   // start_date >=
    @IsOptional() @IsISO8601() startTo?: string;     // start_date <=

    @IsOptional() @Type(() => Number) @IsInt() @Min(0) offset?: number = 0;
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number = 50;
}