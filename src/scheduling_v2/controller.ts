import { Body, Controller, Get, Post } from '@nestjs/common';
import { SchedulingV2Service } from './service';
import { SchedulingReorderTasksDto, SchedulingUpdateDeadlineDto, SchedulingUpdateEndDateDto } from './dto';




@Controller('scheduling/v2')
export class SchedulingV2Controller {

    constructor(
        private readonly service: SchedulingV2Service,
    ) {}


    @Get('snapshot')
    async snapshotV2() {
        return this.service.snapshot();
    }

    @Post('reorder')
    async reorder(@Body() dto: SchedulingReorderTasksDto) {
        return this.service.reorder(dto);
    }

    @Post('tasks/update-end-date')
    async updateEndDate(@Body() dto: SchedulingUpdateEndDateDto) {
        return this.service.updateEndDate(dto);
    }

    @Post('tasks/update-deadline')
    async updateDeadline(@Body() dto: SchedulingUpdateDeadlineDto) {
        return this.service.updateDeadline(dto);
    }
}
