import { ArrayMinSize, IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderLaneDto {
    @IsString()
    cncId!: string;

    @IsInt()
    wcaNo!: number;

    @IsArray()
    @ArrayMinSize(0)
    @IsString({ each: true })
    taskIds!: string[];
}

export class ReorderTasksDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ReorderLaneDto)
    lanes!: ReorderLaneDto[];
}