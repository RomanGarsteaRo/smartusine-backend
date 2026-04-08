import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CncsService } from './cncs.service';
import { CreateCncDto } from './dto/create-cnc.dto';
import { UpdateCncDto } from './dto/update-cnc.dto';
import { QueryCncDto } from './dto/query-cnc.dto';

@Controller('cncs')
export class CncsController {
    constructor(private readonly service: CncsService) {}

    @Get()
    findAll(@Query() q: QueryCncDto) {
        return this.service.findAll(q);
    }

    @Get('summary')
    summary() {
        return this.service.summary();
    }

    @Get(':wcaNo')
    findOne(@Param('wcaNo', ParseIntPipe) wcaNo: number) {
        return this.service.findOne(wcaNo);
    }

    @Post()
    create(@Body() dto: CreateCncDto) {
        return this.service.create(dto);
    }

    @Patch(':wcaNo')
    update(@Param('wcaNo', ParseIntPipe) wcaNo: number, @Body() dto: UpdateCncDto) {
        return this.service.update(wcaNo, dto);
    }

    @Delete(':wcaNo')
    remove(@Param('wcaNo', ParseIntPipe) wcaNo: number) {
        return this.service.remove(wcaNo);
    }

    @Post('bulk')
    bulkUpsert(@Body() rows: CreateCncDto[]) {
        return this.service.upsertMany(rows);
    }
}
