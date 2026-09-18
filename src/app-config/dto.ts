import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SchedulerLineOrderItemDto {
    @Type(() => Number)
    @IsInt()
    wcaNo!: number;

    @IsOptional()
    @IsString()
    wcaName?: string;

    @IsOptional()
    @IsString()
    cncName?: string;
}

export class UpdateSchedulerLineOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SchedulerLineOrderItemDto)
    lineOrder!: SchedulerLineOrderItemDto[];
}
