import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApplicationConfigService } from './service';
import { UpdateSchedulerLineOrderDto } from './dto';

@Controller('app-config')
export class ApplicationConfigController {
    constructor(private readonly service: ApplicationConfigService) {}

    @Get('scheduler')
    getSchedulerConfig() {
        return this.service.getSchedulerConfig();
    }

    @Put('scheduler/line-order')
    updateSchedulerLineOrder(@Body() dto: UpdateSchedulerLineOrderDto) {
        return this.service.setSchedulerLineOrder(dto.lineOrder);
    }
}
