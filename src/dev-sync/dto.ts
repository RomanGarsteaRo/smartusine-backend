import { IsBoolean, IsOptional } from 'class-validator';

export class SyncSchedulingDto {
    @IsOptional() @IsBoolean() replaceTasks?: boolean = true;
    @IsOptional() @IsBoolean() replaceCncs?: boolean = true;
}
