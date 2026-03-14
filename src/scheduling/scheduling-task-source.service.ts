import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TasksService } from '../tasks/tasks.service';
import { mapRawToTask } from '../tasks/data/map-task';

export type SchedulingTaskSourceMode = 'db' | 'remote';

@Injectable()
export class SchedulingTaskSourceService {
    constructor(
        private readonly config: ConfigService,
        private readonly tasks: TasksService,
    ) {}

    async findForScheduling(wcaNos: number[]): Promise<any[]> {
        const uniqWcaNos = Array.from(new Set((wcaNos ?? []).filter((v): v is number => Number.isFinite(v))));
        if (!uniqWcaNos.length) return [];

        const mode = this.getMode();
        if (mode === 'remote') {
            return this.findFromRemote(uniqWcaNos);
        }

        return this.findFromDb(uniqWcaNos);
    }

    private getMode(): SchedulingTaskSourceMode {
        const raw = (this.config.get<string>('SCHEDULING_TASK_SOURCE') ?? 'db').trim().toLowerCase();
        return raw === 'remote' ? 'remote' : 'db';
    }

    private async findFromDb(wcaNos: number[]): Promise<any[]> {
        const { data } = await this.tasks.findAll({
            wcaNoIn: wcaNos,
            limit: 5000,
            offset: 0,
        } as any);

        return data;
    }

    private async findFromRemote(wcaNos: number[]): Promise<any[]> {
        const url = (this.config.get<string>('SCHEDULING_REMOTE_TASKS_URL') ?? 'http://10.0.0.62:1880/usinage/all_jobs').trim();
        const timeoutMs = this.getTimeoutMs();

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'accept': 'application/json' },
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new ServiceUnavailableException(`Remote scheduling source failed: ${response.status} ${response.statusText}`);
            }

            const raw = await response.json();
            if (!Array.isArray(raw)) {
                throw new ServiceUnavailableException('Remote scheduling source did not return an array');
            }

            const allow = new Set(wcaNos);

            return raw
                .map((item: any) => mapRawToTask(item))
                .filter((task: any) => task?.wcaNo != null && allow.has(Number(task.wcaNo)));
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                throw new ServiceUnavailableException(`Remote scheduling source timeout after ${timeoutMs}ms`);
            }
            if (error instanceof ServiceUnavailableException) {
                throw error;
            }
            throw new ServiceUnavailableException(`Remote scheduling source unavailable: ${error?.message ?? 'unknown error'}`);
        } finally {
            clearTimeout(timer);
        }
    }

    private getTimeoutMs(): number {
        const raw = Number(this.config.get<string>('SCHEDULING_REMOTE_TIMEOUT_MS') ?? '15000');
        return Number.isFinite(raw) && raw > 0 ? raw : 15000;
    }
}
