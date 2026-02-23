import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { WorkUzineCalendarService } from './week-template.service';
import { CreateWorkUzineCalendarDto, UpdateWorkUzineCalendarDto } from './dto/week-template.dto';







@Controller('work/calendars')
export class WorkUzineCalendarController {
    constructor(private readonly svc: WorkUzineCalendarService) {}

    @Get('active')
    getActive(@Query('day') day?: string) {
        // /work/calendars/active?day=2026-02-17
        return this.svc.getActiveForDay(day ?? '');
    }

    /**
     * Optional:
     *  /work/calendars?from=2026-02-01&to=2026-03-01
     */
    @Get()
    list(@Query('from') from?: string, @Query('to') to?: string) {
        return this.svc.list({ from, to });
    }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.svc.getOne(id);
    }

    @Post()
    create(@Body() dto: CreateWorkUzineCalendarDto) {
        return this.svc.create(dto);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkUzineCalendarDto) {
        return this.svc.update(id, dto);
    }
}