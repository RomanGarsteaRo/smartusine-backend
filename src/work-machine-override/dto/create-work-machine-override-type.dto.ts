import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { WorkMachineOverrideEffect } from '../entities/work-machine-override-type.entity';

export class CreateWorkMachineOverrideTypeDto {
    @IsString()
    @Length(1, 64)
    code!: string;

    @IsString()
    @Length(1, 120)
    name!: string;

    @IsEnum(WorkMachineOverrideEffect)
    effect!: WorkMachineOverrideEffect;

    @IsOptional()
    @IsString()
    @Length(1, 32)
    color?: string | null;
}
