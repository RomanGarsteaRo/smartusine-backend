import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { WorkMachineCalendarService } from './service';
import { CreateWorkMachineCalendarDto, UpdateWorkMachineCalendarDto } from './dto';

@Controller('work/machine-calendars')
export class WorkMachineCalendarController {
    constructor(private readonly svc: WorkMachineCalendarService) {}

    @Get('active')
    getActive(
        @Query('day') day?: string,
        @Query('cncId') cncId?: string,
    ) {
        // /work/machine-calendars/active?day=2026-02-17&cncId=CNC-01
        return this.svc.getActiveForDay(day ?? '', cncId ?? '');
    }

    @Get()
    list(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('cncId') cncId?: string,
    ) {
        // /work/machine-calendars?from=2026-02-01&to=2026-03-01&cncId=CNC-01
        return this.svc.list({ from, to, cncId });
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