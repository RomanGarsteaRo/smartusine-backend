import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { WorkMachineCalendarService } from './service';
import { CreateWorkMachineCalendarDto, UpdateWorkMachineCalendarDto } from './dto';

function parseOptionalWcaNo(raw?: string): number | undefined {
    if (raw == null || raw.trim() === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
}

@Controller('work/machine-calendars')
export class WorkMachineCalendarController {
    constructor(private readonly svc: WorkMachineCalendarService) {}

    @Get('active')
    getActive(
        @Query('day') day?: string,
        @Query('wcaNo') wcaNoRaw?: string,
    ) {
        return this.svc.getActiveForDay(day ?? '', parseOptionalWcaNo(wcaNoRaw));
    }

    @Get()
    list(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('wcaNo') wcaNoRaw?: string,
    ) {
        return this.svc.list({
            from,
            to,
            wcaNo: parseOptionalWcaNo(wcaNoRaw),
        });
    }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.svc.getOne(id);
    }

    @Post()
    create(@Body() dto: CreateWorkMachineCalendarDto) {
        return this.svc.create(dto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWorkMachineCalendarDto,
    ) {
        return this.svc.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.svc.remove(id);
    }
}