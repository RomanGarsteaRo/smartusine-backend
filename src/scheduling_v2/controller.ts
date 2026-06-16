import { Body, Controller, Get, Post } from '@nestjs/common';
import { SchedulingV2Service } from './service';
import {
    SchedulingReorderByDeadlineDto,
    SchedulingReorderTasksDto,
    SchedulingUpdateDeadlineDto,
    SchedulingUpdateEndDateDto,
    SchedulingUpdateUrgencyDto,
} from './dto';




@Controller('scheduling/v2')
export class SchedulingV2Controller {

    constructor(
        private readonly service: SchedulingV2Service,
    ) {}


    @Get('snapshot')
    async snapshotV2() {
        return this.service.snapshot();
    }

    /* Drag & Drop */
    @Post('reorder')
    async reorder(@Body() dto: SchedulingReorderTasksDto) {
        return this.service.reorder(dto);
    }

    /* Reorder By Deadline */
    @Post('reorder-by-deadline')
    async reorderByDeadline(@Body() dto: SchedulingReorderByDeadlineDto) {
        return this.service.reorderByDeadline(dto);
    }


    @Post('tasks/update-deadline')
    async updateDeadline(@Body() dto: SchedulingUpdateDeadlineDto) {
        return this.service.updateDeadline(dto);
    }

    @Post('tasks/update-end-date')
    async updateEndDate(@Body() dto: SchedulingUpdateEndDateDto) {
        return this.service.updateEndDate(dto);
    }

    @Post('tasks/update-urgency')
    async updateUrgency(@Body() dto: SchedulingUpdateUrgencyDto) {
        return this.service.updateUrgency(dto);
    }
}
