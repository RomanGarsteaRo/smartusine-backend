import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SchedulingGateway } from '../web-socket/sheduling.gateway';
import { SchedulingTaskStateEntity } from './task-state.entity';

/**
 * Updates the Work Calendar specific urgency level for a task.
 *
 * The task itself is not modified. Only the local scheduler state is updated.
 * This keeps the imported/shared task entity stable and prevents side effects
 * in other applications that depend on the original task structure.
 */

@Injectable()
export class SchedulingTaskStateService {

    constructor(
        @InjectRepository(SchedulingTaskStateEntity)
        private readonly repo: Repository<SchedulingTaskStateEntity>,
        private readonly ws: SchedulingGateway,
    ) {}

    private normalizeTaskId(value: unknown): string {
        const id = String(value ?? '').trim();
        if (!id) throw new BadRequestException('Task id is required');
        return id;
    }

    private toUrgencyLevel(value: unknown): number {
        const n = Number(value ?? 0);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(2, Math.trunc(n)));
    }

    async findUrgencyMap(taskIds: string[]): Promise<Map<string, number>> {
        const ids = Array.from(new Set((taskIds ?? []).map(id => String(id ?? '').trim()).filter(Boolean)));
        if (!ids.length) return new Map();

        const rows = await this.repo.find({
            where: { taskId: In(ids) },
        });

        return new Map(rows.map(row => [row.taskId, this.toUrgencyLevel(row.urgencyLevel)]));
    }

    async updateUrgency(taskId: string, urgencyLevel: number | null | undefined): Promise<SchedulingTaskStateEntity> {
        const id = this.normalizeTaskId(taskId);
        const level = this.toUrgencyLevel(urgencyLevel);

        const existing = await this.repo.findOne({ where: { taskId: id } });
        const entity = existing ?? this.repo.create({ taskId: id });
        entity.urgencyLevel = level;

        const saved = await this.repo.save(entity);
        this.ws.emitStatusBlueChanged();
        return saved;
    }
}
