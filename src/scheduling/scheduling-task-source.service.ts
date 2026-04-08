import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TasksService } from '../tasks/tasks.service';
import { mapRawToTask } from '../tasks/data/map-task';
import {
    getSchedulingRemoteTasksUrl,
    getSchedulingRemoteTimeoutMs,
    getSchedulingSourceMode,
} from '../_remote/source-mode';
import { fetchRemoteJsonArray } from '../_remote/remote-fetch';

@Injectable()
export class SchedulingTaskSourceService {
    constructor(
        private readonly config: ConfigService,
        private readonly tasks: TasksService,
    ) {}

    async findForScheduling(wcaNos: number[]): Promise<any[]> {
        const uniqWcaNos = Array.from(new Set((wcaNos ?? []).filter((v): v is number => Number.isFinite(v))));
        if (!uniqWcaNos.length) return [];

        const mode = getSchedulingSourceMode(this.config);
        if (mode === 'remote') {
            return this.findFromRemote(uniqWcaNos);
        }
        return this.findFromDb(uniqWcaNos);
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
        const url = getSchedulingRemoteTasksUrl(this.config);
        const timeoutMs = getSchedulingRemoteTimeoutMs(this.config);
        const raw = await fetchRemoteJsonArray(url, timeoutMs, 'Remote scheduling task source');
        const allow = new Set(wcaNos);

        return raw
            .map((item: any) => mapRawToTask(item))
            .filter((task: any) => task?.wcaNo != null && allow.has(Number(task.wcaNo)));
    }
}
