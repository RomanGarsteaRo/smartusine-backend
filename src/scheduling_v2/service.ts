import { Injectable } from '@nestjs/common';
import {
    SchedulingLineDto,
    SchedulingReorderByDeadlineDto,
    SchedulingReorderTasksDto,
    SchedulingSnapshotDto,
    SchedulingTaskDto,
    SchedulingTaskFlagsDto,
    SchedulingUpdateDeadlineDto,
    SchedulingUpdateEndDateDto,
} from './dto';
import { SchedulingTaskSourceService } from '../scheduling/scheduling-task-source.service';
import { SchedulingLineSourceService } from '../scheduling/scheduling-line-source.service';
import { TasksService } from '../tasks/tasks.service';
import { taskEndDateToEpochMs } from '../tasks/data/task-end-date';

const MS_PER_HOUR = 3_600_000;

@Injectable()
export class SchedulingV2Service {


    constructor(
        private readonly schedulingTaskSource: SchedulingTaskSourceService,
        private readonly schedulingLineSource: SchedulingLineSourceService,
        private readonly taskService: TasksService,
    ) {
    }


    async snapshot(): Promise<SchedulingSnapshotDto> {
        const lines = await this.fetchLines();
        const wcaNos = lines.map(x => x.wcaNo);

        const rawTasks = await this.schedulingTaskSource.findForScheduling(wcaNos);
        const tasksByWca = new Map<number, SchedulingTaskDto[]>();

        for (const raw of rawTasks) {
            const task = this.mapTask(raw);
            if (!task) continue;
            if (!wcaNos.includes(task.wcaNo)) continue;

            const bucket = tasksByWca.get(task.wcaNo) ?? [];
            bucket.push(task);
            tasksByWca.set(task.wcaNo, bucket);
        }

        for (const [, bucket] of tasksByWca) {
            bucket.sort((a, b) => this.compareTasks(a, b));
        }

        const tasks: SchedulingTaskDto[] = [];
        const snapshotLines: SchedulingLineDto[] = lines.map(line => {
            const lineTasks = tasksByWca.get(line.wcaNo) ?? [];
            tasks.push(...lineTasks);

            return {
                wcaNo: line.wcaNo,
                wcaName: line.wcaName,
                cncName: line.cncName,
                activeAxes: line.activeAxes,
                taskIds: lineTasks.map(t => t.id),
            };
        });

        return {
            generatedAt: Date.now(),
            lines: snapshotLines,
            tasks,
        };
    }



    async reorder(dto: SchedulingReorderTasksDto) {
        return this.taskService.reorderTasks(dto as any);
    }
    async reorderByDeadline(dto: SchedulingReorderByDeadlineDto) {
        return this.taskService.reorderTasksByDeadline(dto.wcaNo);
    }


    async updateEndDate(dto: SchedulingUpdateEndDateDto) {
        const saved = await this.taskService.updateSchedulingTaskEndDate(dto.id, dto.endDate ?? null);
        return {
            ok: true,
            id: saved.id,
            endDate: saved.endDate ? saved.endDate.toISOString() : null,
        };
    }

    async updateDeadline(dto: SchedulingUpdateDeadlineDto) {
        const saved = await this.taskService.updateSchedulingTaskDeadline(dto.id, dto.deadline ?? null);
        return {
            ok: true,
            id: saved.id,
            deadline: saved.dateRequis ?? null,
        };
    }

    private async fetchLines(): Promise<SchedulingLineDto[]> {
        const lines = await this.schedulingLineSource.findForScheduling();
        return lines.map(line => ({
            wcaNo: line.wcaNo,
            wcaName: line.wcaName ?? '',
            cncName: line.cncName ?? '',
            activeAxes: line.activeAxes ?? '',
            taskIds: [],
        }));
    }

    private mapTask(raw: any): SchedulingTaskDto | null {
        const id = this.toStr(raw?.id);
        const wcaNo = this.toNum(raw?.wcaNo, null);

        if (!id || wcaNo == null) return null;

        const qty_toMake = this.toNum(raw?.qtyToFab, 0)!;
        const qty_made = this.toNum(raw?.qtyFab, 0)!;

        const fab_cycleNetMs =
            this.toNum(raw?.estimPerPartTimeNet ?? raw?.estimPerPartTime, 0)! * MS_PER_HOUR;

        const totalWithSetupMs = this.toNum(raw?.fabTimes, 0)! * MS_PER_HOUR;

        let fab_setupMs = 0;
        if (totalWithSetupMs > 0 && qty_toMake > 0 && fab_cycleNetMs > 0) {
            fab_setupMs = Math.max(0, totalWithSetupMs - qty_toMake * fab_cycleNetMs);
        }

        const qty_left = Math.max(0, qty_toMake - qty_made);
        const qty_done = Math.min(qty_made, qty_toMake);
        const qty_extra = Math.max(0, qty_made - qty_toMake);
        const progress = qty_toMake > 0 ? qty_done / qty_toMake : 0;

        const fab_workTotalMs = qty_toMake * fab_cycleNetMs + fab_setupMs;
        const fab_workLeftMs = qty_left * fab_cycleNetMs + (qty_made > 0 ? 0 : fab_setupMs);

        const deadlineMs = this.toEpochMs(raw?.dateRequis);
        const fab_deadlineMs = deadlineMs ? deadlineMs : null;
        const fab_endDateMs = taskEndDateToEpochMs(raw?.endDate ?? raw?.END_DATE);

        const flags: SchedulingTaskFlagsDto = {
            green: !!raw?.statGreen,
            orange: !!raw?.statOrange,
            red: !!raw?.statRed,
            yell: !!raw?.statYell,
            blue: !!raw?.statBlue,
            pink: !!raw?.statPink,
            white: !!raw?.statWhite,
        };

        return {
            id,

            wcaNo,
            wcaName: this.toStr(raw?.wcaName) ?? '',

            clientName: this.toStr(raw?.clientName) ?? '',
            clientNo: this.toStr(raw?.clientNo) ?? '',
            jobNo: this.toStr(raw?.jobNo) ?? '',
            partNo: this.toStr(raw?.partNo) ?? '',
            projectNo: this.toNum(raw?.projectNo, 0)!,
            revNo: this.toStr(raw?.revNo) ?? '',

            qty_toMake,
            qty_made,
            qty_left,
            qty_done,
            qty_extra,
            progress,

            fab_cycleNetMs,
            fab_setupMs,
            fab_workTotalMs,
            fab_workLeftMs,
            fab_deadlineMs,
            fab_endDateMs,
            parkedLeft: !!raw?.parkedLeft,

            ord: this.toNum(raw?.ord, 0)!,
            status: this.toNum(raw?.statTask ?? raw?.status, 0)!,
            flags,
        };
    }

    private compareTasks(a: SchedulingTaskDto, b: SchedulingTaskDto): number {
        const ad = this.getSortEndMs(a);
        const bd = this.getSortEndMs(b);
        if (ad !== bd) return ad - bd;

        const ao = a.ord ?? Number.POSITIVE_INFINITY;
        const bo = b.ord ?? Number.POSITIVE_INFINITY;
        if (ao !== bo) return ao - bo;

        return a.id.localeCompare(b.id);
    }


    private getSortEndMs(task: SchedulingTaskDto): number {
        return task.fab_endDateMs ?? task.fab_deadlineMs ?? Number.POSITIVE_INFINITY;
    }

    private toNum(v: unknown, fallback: number | null): number | null {
        if (v === null || v === undefined || v === '') return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    }

    private toStr(v: unknown): string | null {
        return v === null || v === undefined ? null : String(v);
    }

    private toEpochMs(v: unknown): number | null {
        if (!v) return null;
        const d = new Date(String(v));
        const t = d.getTime();
        return Number.isFinite(t) ? t : null;
    }
}
