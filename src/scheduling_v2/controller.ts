import { Controller, Get } from '@nestjs/common';
import { SchedulingV2Service } from './service';




@Controller('scheduling/v2')
export class SchedulingV2Controller {

    constructor(
        private readonly service: SchedulingV2Service,
    ) {}


    @Get('snapshot')
    async snapshotV2() {
        return this.service.snapshot();
    }
}
