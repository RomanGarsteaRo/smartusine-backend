import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CncsService } from '../cncs/cncs.service';
import {
    getSchedulingRemoteTimeoutMs,
    getSchedulingRemoteWcasUrl,
    getSchedulingSourceMode,
} from '../_remote/source-mode';
import { fetchRemoteJsonArray } from '../_remote/remote-fetch';

export type SchedulingLineSourceDto = {
    wcaNo: number;
    wcaName: string | null;
    cncName: string | null;
    activeAxes: string | null;
};

type RemoteWcaRaw = {
    WCA_NO?: unknown;
    WCA_NAME?: unknown;
    CncName?: unknown;
    activeaxes?: unknown;
};

@Injectable()
export class SchedulingLineSourceService {
    constructor(
        private readonly config: ConfigService,
        private readonly cncs: CncsService,
    ) {}

    async findForScheduling(): Promise<SchedulingLineSourceDto[]> {
        const mode = getSchedulingSourceMode(this.config);
        if (mode === 'remote') {
            return this.findFromRemote();
        }
        return this.findFromDb();
    }

    private async findFromDb(): Promise<SchedulingLineSourceDto[]> {
        const rows = await this.cncs.summary();
        return rows.map(row => ({
            wcaNo: row.wcaNo,
            wcaName: row.wcaName ?? null,
            cncName: row.cncName ?? null,
            activeAxes: row.activeAxes ?? null,
        }));
    }

    private async findFromRemote(): Promise<SchedulingLineSourceDto[]> {
        const url = getSchedulingRemoteWcasUrl(this.config);
        const timeoutMs = getSchedulingRemoteTimeoutMs(this.config);
        const raw = await fetchRemoteJsonArray(url, timeoutMs, 'Remote scheduling WCA source');

        return raw
            .map((item: RemoteWcaRaw) => this.mapLine(item))
            .filter((line): line is SchedulingLineSourceDto => !!line)
            .sort((a, b) => a.wcaNo - b.wcaNo || (a.cncName ?? '').localeCompare(b.cncName ?? ''));
    }

    private mapLine(raw: RemoteWcaRaw): SchedulingLineSourceDto | null {
        const wcaNo = this.toNum(raw?.WCA_NO, null);
        if (wcaNo == null) return null;

        return {
            wcaNo,
            wcaName: this.toStr(raw?.WCA_NAME),
            cncName: this.toStr(raw?.CncName),
            activeAxes: this.toStr(raw?.activeaxes),
        };
    }

    private toNum(v: unknown, fallback: number | null): number | null {
        if (v === null || v === undefined || v === '') return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
    }

    private toStr(v: unknown): string | null {
        return v === null || v === undefined ? null : String(v);
    }
}
