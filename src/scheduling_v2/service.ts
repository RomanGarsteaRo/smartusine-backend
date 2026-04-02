import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulingLineDto, SchedulingSnapshotDto, SchedulingTaskDto, SchedulingTaskFlagsDto } from './dto';
import { SchedulingTaskSourceService } from '../scheduling/scheduling-task-source.service';






const MS_PER_HOUR = 3_600_000;
type RemoteWcaRaw = {
    WCA_NO?: unknown;
    WCA_NAME?: unknown;
    CncName?: unknown;
    activeaxes?: unknown;
};






@Injectable()
export class SchedulingV2Service {
    constructor(
        private readonly config: ConfigService,
        private readonly schedulingTaskSource: SchedulingTaskSourceService,
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

    private async fetchLines(): Promise<SchedulingLineDto[]> {
        const url = (this.config.get<string>('SCHEDULING_REMOTE_WCAS_URL') ?? 'http://10.0.0.62:1880/usinage/all_wca').trim();

        const timeoutMs = this.getTimeoutMs();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { accept: 'application/json' },
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new ServiceUnavailableException(
                    `Remote WCA source failed: ${response.status} ${response.statusText}`,
                );
            }

            const raw = await response.json();
            if (!Array.isArray(raw)) {
                throw new ServiceUnavailableException('Remote WCA source did not return an array');
            }

            return raw
                .map((item: RemoteWcaRaw) => this.mapLine(item))
                .filter((line): line is SchedulingLineDto => !!line);
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                throw new ServiceUnavailableException(`Remote WCA source timeout after ${timeoutMs}ms`);
            }
            if (error instanceof ServiceUnavailableException) {
                throw error;
            }
            throw new ServiceUnavailableException(
                `Remote WCA source unavailable: ${error?.message ?? 'unknown error'}`,
            );
        } finally {
            clearTimeout(timer);
        }
    }

    private mapLine(raw: RemoteWcaRaw): SchedulingLineDto | null {
        const wcaNo = this.toNum(raw?.WCA_NO, null);
        const wcaName= this.toStr(raw?.WCA_NAME);
        const cncName = this.toStr(raw?.CncName);
        const activeAxes = this.toStr(raw?.activeaxes);
        if (wcaNo == null) return null;

        return {
            wcaNo,
            wcaName,
            cncName,
            activeAxes,
            taskIds: [],
        };
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
        const deadlineOffsetMs = 2*24*60*60*1000; /* Two Days */
        const fab_deadlineMs = deadlineMs ? deadlineMs - deadlineOffsetMs : null;

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
            wcaName: this.toStr(raw?.wcaName),

            clientName: this.toStr(raw?.clientName),
            clientNo: this.toStr(raw?.clientNo),
            jobNo: this.toStr(raw?.jobNo),
            partNo: this.toStr(raw?.partNo),
            projectNo: this.toNum(raw?.projectNo, 0)!,
            revNo: this.toStr(raw?.revNo),

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

            ord: this.toNum(raw?.ord, 0)!,
            status: this.toNum(raw?.statTask ?? raw?.status, 0)!,
            flags,
        };
    }

    private compareTasks(a: SchedulingTaskDto, b: SchedulingTaskDto): number {
        const ad = a.fab_deadlineMs ?? Number.POSITIVE_INFINITY;
        const bd = b.fab_deadlineMs ?? Number.POSITIVE_INFINITY;
        return (ad - bd);
    }

    private toNum(value: unknown, fallback: number | null): number | null {
        if (value === null || value === undefined || value === '') return fallback;
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    private toStr(value: unknown): string {
        return value === null || value === undefined ? '' : String(value);
    }

    private toEpochMs(value: unknown): number | null {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (value instanceof Date) {
            const ms = value.getTime();
            /*  -2 days (2*24*60*60*1000) SPEC  */
            return Number.isFinite(ms) ? ms - 2*24*60*60*1000 : null;
        }

        const d = new Date(String(value));
        const ms = d.getTime();
        return Number.isFinite(ms) ? ms : null;
    }

    private getTimeoutMs(): number {
        const raw = Number(this.config.get<string>('SCHEDULING_REMOTE_TIMEOUT_MS') ?? '15000');
        return Number.isFinite(raw) && raw > 0 ? raw : 15000;
    }
}
