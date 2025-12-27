import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
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


    @Get(':cncId')
    findOne(@Param('cncId') cncKey: string) {
        return this.service.findOne(cncKey);
    }

    @Post()
    create(@Body() dto: CreateCncDto) {
        return this.service.create(dto);
    }

    @Patch(':cncId')
    update(@Param('cncId') cncKey: string, @Body() dto: UpdateCncDto) {
        return this.service.update(cncKey, dto);
    }

    @Delete(':cncId')
    remove(@Param('cncId') cncKey: string) {
        return this.service.remove(cncKey);
    }

    @Post('bulk')
    bulkUpsert(@Body() rows: CreateCncDto[]) {
        return this.service.upsertMany(rows);
    }
}
