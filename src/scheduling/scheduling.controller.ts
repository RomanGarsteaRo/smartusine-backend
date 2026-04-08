import { Body, Controller, Get, Post } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { ReorderTasksDto } from '../tasks/dto/reorder-tasks.dto';
import { SchedulingTaskSourceService } from './scheduling-task-source.service';
import { SchedulingLineSourceService } from './scheduling-line-source.service';

@Controller('scheduling')
export class SchedulingController {

    constructor(
        private readonly tasks: TasksService,
        private readonly schedulingTaskSource: SchedulingTaskSourceService,
        private readonly schedulingLineSource: SchedulingLineSourceService,
    ) {}

    @Get('snapshot')
    async snapshot() {
        const cncs = await this.schedulingLineSource.findForScheduling();
        const wcaNos = cncs.map(c => c.wcaNo).filter((v): v is number => v != null);
        const tasks = await this.schedulingTaskSource.findForScheduling(wcaNos);

        const tasksByWca: Record<string, any[]> = {};
        for (const t of tasks) {
            const key = String(t.wcaNo ?? '');
            if (!key) continue;
            (tasksByWca[key] ||= []).push(t);
        }

        for (const key of Object.keys(tasksByWca)) {
            tasksByWca[key].sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0));
        }

        return {
            generatedAt: Date.now(),
            cncs,
            tasksByWca,
        };
    }

    @Post('reorder')
    async reorder(@Body() dto: ReorderTasksDto) {
        return this.tasks.reorderTasks(dto);
    }
}
