import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CncsService } from '../cncs/cncs.service';
import { mapRawToCnc } from '../cncs/data/map-cnc';
import { SchedulingGateway } from '../web-socket/sheduling.gateway';
import { fetchRemoteJsonArray } from '../_remote/remote-fetch';
import {
    getSchedulingRemoteTasksUrl,
    getSchedulingRemoteTimeoutMs,
    getSchedulingRemoteWcasUrl,
    getSchedulingSourceMode,
} from '../_remote/source-mode';
import { mapRawToTask } from '../tasks/data/map-task';
import { TasksService } from '../tasks/tasks.service';
import { SyncSchedulingDto } from './dto';

@Injectable()
export class DevSyncService {
    constructor(
        private readonly config: ConfigService,
        private readonly tasks: TasksService,
        private readonly cncs: CncsService,
        private readonly ws: SchedulingGateway,
    ) {}

    async getStatus() {
        return {
            enabled: this.isEnabled(),
            schedulingSource: getSchedulingSourceMode(this.config),
            db: {
                tasks: await this.tasks.countAll(),
                cncs: await this.cncs.countAll(),
            },
            remote: {
                tasksUrl: getSchedulingRemoteTasksUrl(this.config),
                wcasUrl: getSchedulingRemoteWcasUrl(this.config),
                timeoutMs: getSchedulingRemoteTimeoutMs(this.config),
            },
        };
    }

    async syncScheduling(options: SyncSchedulingDto = {}) {
        this.ensureEnabled();

        const replaceTasks = options.replaceTasks ?? true;
        const replaceCncs = options.replaceCncs ?? true;
        const timeoutMs = getSchedulingRemoteTimeoutMs(this.config);

        const [remoteWcas, remoteTasks] = await Promise.all([
            fetchRemoteJsonArray(getSchedulingRemoteWcasUrl(this.config), timeoutMs, 'Remote scheduling WCA sync source'),
            fetchRemoteJsonArray(getSchedulingRemoteTasksUrl(this.config), timeoutMs, 'Remote scheduling task sync source'),
        ]);

        const cncRows = remoteWcas
            .map(mapRawToCnc)
            .filter(row => Number.isFinite(row?.wcaNo));

        const taskRows = remoteTasks
            .map(mapRawToTask)
            .filter(row => !!row?.id);

        await this.cncs.upsertMany(cncRows as any);
        await this.tasks.upsertMany(taskRows as any);

        const deletedCncs = replaceCncs
            ? await this.cncs.deleteMissingExcept(cncRows.map(row => row.wcaNo).filter((v): v is number => Number.isFinite(v)))
            : 0;

        const deletedTasks = replaceTasks
            ? await this.tasks.deleteMissingExcept(taskRows.map(row => row.id))
            : 0;

        this.ws.emitStatusBlueChanged();

        return {
            ok: true,
            source: 'client-remote',
            target: 'local-db',
            schedulingSource: getSchedulingSourceMode(this.config),
            fetched: {
                cncs: remoteWcas.length,
                tasks: remoteTasks.length,
            },
            stored: {
                cncs: cncRows.length,
                tasks: taskRows.length,
            },
            deleted: {
                cncs: deletedCncs,
                tasks: deletedTasks,
            },
            replace: {
                cncs: replaceCncs,
                tasks: replaceTasks,
            },
            db: {
                cncs: await this.cncs.countAll(),
                tasks: await this.tasks.countAll(),
            },
        };
    }

    private isEnabled(): boolean {
        return (this.config.get<string>('DEV_SYNC_ENABLED') ?? 'false').trim().toLowerCase() === 'true';
    }

    private ensureEnabled(): void {
        if (!this.isEnabled()) {
            throw new ForbiddenException('Dev sync is disabled. Set DEV_SYNC_ENABLED=true to allow remote-to-local refresh.');
        }
    }
}
