import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationConfigEntity } from './entity';

export const SCHEDULER_CONFIG_KEY = 'scheduler';

export interface SchedulerLineOrderItem {
    wcaNo: number;
    wcaName?: string;
    cncName?: string;
}

export interface SchedulerConfig {
    lineOrder: SchedulerLineOrderItem[];
}

export const DEFAULT_SCHEDULER_LINE_ORDER: SchedulerLineOrderItem[] = [
    { wcaNo: 10077, wcaName: 'CTX_1',   cncName: 'CTX'    },
    { wcaNo: 10073, wcaName: 'WT1_1',   cncName: 'WT 1'   },
    { wcaNo: 10074, wcaName: 'WT2_1',   cncName: 'WT 2'   },
    { wcaNo: 10075, wcaName: 'WT3_1',   cncName: 'WT 3'   },
    { wcaNo: 10087, wcaName: 'WT4_1',   cncName: 'WT 4'   },
    { wcaNo: 10076, wcaName: 'PUMA_1',  cncName: 'PUMA'   },
    { wcaNo: 10072, wcaName: 'LYNX2_1', cncName: 'LYNX 2' },
    { wcaNo: 10078, wcaName: 'DMC_1',   cncName: 'DMC'    },
    { wcaNo: 10079, wcaName: 'DNM_1',   cncName: 'DNM'    },
    { wcaNo: 10086, wcaName: 'LYNX3_1', cncName: 'LYNX 3' },
    { wcaNo: 10071, wcaName: 'LYNX1_1', cncName: 'LYNX 1' },
];

@Injectable()
export class ApplicationConfigService {
    private readonly logger = new Logger(ApplicationConfigService.name);

    constructor(
        @InjectRepository(ApplicationConfigEntity)
        private readonly repo: Repository<ApplicationConfigEntity>,
    ) {}

    async getSchedulerConfig(): Promise<SchedulerConfig> {
        try {
            const row = await this.repo.findOne({ where: { configKey: SCHEDULER_CONFIG_KEY } });
            const value = this.toObject(row?.configValue);
            const lineOrder = this.toLineOrderArray(value?.lineOrder);

            return {
                lineOrder: lineOrder.length ? lineOrder : this.defaultLineOrder(),
            };
        } catch (err) {
            this.logger.warn(`Cannot read app_config.scheduler. Default scheduler config will be used. ${this.errorMessage(err)}`);
            return {
                lineOrder: this.defaultLineOrder(),
            };
        }
    }

    private defaultLineOrder(): SchedulerLineOrderItem[] {
        return DEFAULT_SCHEDULER_LINE_ORDER.map(item => ({ ...item }));
    }

    private toObject(value: unknown): Record<string, unknown> {
        if (!value) return {};

        if (typeof value === 'string') {
            try {
                const parsed: unknown = JSON.parse(value);
                return this.toObject(parsed);
            } catch {
                return {};
            }
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }

        return {};
    }

    private toLineOrderArray(value: unknown): SchedulerLineOrderItem[] {
        if (!Array.isArray(value)) return [];

        const seen = new Set<number>();
        const result: SchedulerLineOrderItem[] = [];

        for (const item of value) {
            const source = this.toObject(item);
            const wcaNo = this.toNumber(source.wcaNo);

            if (wcaNo == null || seen.has(wcaNo)) continue;

            seen.add(wcaNo);
            result.push({
                wcaNo,
                wcaName: this.toNonEmptyString(source.wcaName),
                cncName: this.toNonEmptyString(source.cncName),
            });
        }

        return result;
    }

    private toNumber(value: unknown): number | null {
        const n = Number(value);
        return Number.isInteger(n) ? n : null;
    }

    private toNonEmptyString(value: unknown): string | undefined {
        const text = String(value ?? '').trim();
        return text || undefined;
    }

    private errorMessage(err: unknown): string {
        return err instanceof Error ? err.message : String(err);
    }
}
