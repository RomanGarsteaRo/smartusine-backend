import { CncsService } from '../cncs/cncs.service';
import { Controller, Get } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';



@Controller('scheduling')
export class SchedulingController {

    constructor(
        private readonly cncs: CncsService,
        private readonly tasks: TasksService,
    ) {}

    @Get('snapshot')
    async snapshot() {
        const cncs = await this.cncs.summary(); // deja ai: cncId, wcaNo, cncName, activeAxes
        const wcaNos = cncs.map(c => c.wcaNo!).filter((v): v is number => v != null);

        // varianta 1: iei toate taskurile și filtrezi la nivel de query (recomandat)
        const { data: tasks } = await this.tasks.findAll({
            wcaNoIn: wcaNos,
            limit: 5000,
            offset: 0,
        } as any);

        // group by wcaNo
        const tasksByWca: Record<string, any[]> = {};
        for (const t of tasks) {
            const key = String(t.wcaNo ?? '');
            if (!key) continue;
            (tasksByWca[key] ||= []).push(t);
        }

        /* Sorting by ord */
        for (const key of Object.keys(tasksByWca)) {
            tasksByWca[key].sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0));
        }

        console.log("tasksByWca:", tasksByWca[10071].length);

        return {
            generatedAt: Date.now(),
            cncs,
            tasksByWca,
        };
    }
}