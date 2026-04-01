import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CreateWorkMachineOverrideDto } from './dto/create-work-machine-override.dto';
import { CreateWorkMachineOverrideTypeDto } from './dto/create-work-machine-override-type.dto';
import { UpdateWorkMachineOverrideDto } from './dto/update-work-machine-override.dto';
import { UpdateWorkMachineOverrideTypeDto } from './dto/update-work-machine-override-type.dto';
import { WorkMachineOverrideService } from './work-machine-override.service';


class FindWorkMachineOverrideQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    wcaNo?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    typeId?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isEnabled?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    fromAbsMs?: number;
}

@Controller('work/machine-overrides')
export class WorkMachineOverrideController {
    constructor(private readonly service: WorkMachineOverrideService) {}

    @Post('types')
    createType(@Body() dto: CreateWorkMachineOverrideTypeDto) {
        return this.service.createType(dto);
    }

    @Get('types/all')
    findAllTypes() {
        return this.service.findAllTypes();
    }

    @Get('types/:id')
    findOneType(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOneType(id);
    }

    @Patch('types/:id')
    updateType(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWorkMachineOverrideTypeDto,
    ) {
        return this.service.updateType(id, dto);
    }

    @Delete('types/:id')
    removeType(@Param('id', ParseIntPipe) id: number) {
        return this.service.removeType(id);
    }

    @Post()
    create(@Body() dto: CreateWorkMachineOverrideDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll(@Query() query: FindWorkMachineOverrideQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWorkMachineOverrideDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}

