import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateWorkMachineOverrideDto } from './dto/create-work-machine-override.dto';
import { CreateWorkMachineOverrideTypeDto } from './dto/create-work-machine-override-type.dto';
import { UpdateWorkMachineOverrideDto } from './dto/update-work-machine-override.dto';
import { UpdateWorkMachineOverrideTypeDto } from './dto/update-work-machine-override-type.dto';
import { WorkMachineOverrideEntity } from './entities/work-machine-override.entity';
import { WorkMachineOverrideTypeEntity } from './entities/work-machine-override-type.entity';






@Injectable()
export class WorkMachineOverrideService {
    constructor(
        @InjectRepository(WorkMachineOverrideEntity)
        private readonly overrideRepo: Repository<WorkMachineOverrideEntity>,
        @InjectRepository(WorkMachineOverrideTypeEntity)
        private readonly typeRepo: Repository<WorkMachineOverrideTypeEntity>,
    ) {
    }

    async create(dto: CreateWorkMachineOverrideDto): Promise<WorkMachineOverrideEntity> {
        await this.ensureTypeExists(dto.typeId);

        const entity = this.overrideRepo.create({
            cncId: dto.cncId,
            typeId: dto.typeId,
            dtstartUtcMs: dto.dtstartUtcMs,
            durationMs: dto.durationMs,
            rrule: dto.rrule ?? null,
            timezone: dto.timezone ?? 'America/Montreal',
            isEnabled: dto.isEnabled ?? true,
            note: dto.note ?? null,
        });

        const saved = await this.overrideRepo.save(entity);
        return this.findOne(saved.id);
    }

    async findAll(filters?: {
        cncId?: string;
        typeId?: number;
        isEnabled?: boolean;
        fromAbsMs?: number;
    }): Promise<WorkMachineOverrideEntity[]> {
        const qb = this.overrideRepo
            .createQueryBuilder('wmo')
            .leftJoinAndSelect('wmo.type', 'type')
            .orderBy('wmo.dtstartUtcMs', 'ASC')
            .addOrderBy('wmo.id', 'ASC');

        if (filters?.cncId) {
            qb.andWhere('wmo.cncId = :cncId', { cncId: filters.cncId });
        }

        if (typeof filters?.typeId === 'number') {
            qb.andWhere('wmo.typeId = :typeId', { typeId: filters.typeId });
        }

        if (typeof filters?.isEnabled === 'boolean') {
            qb.andWhere('wmo.isEnabled = :isEnabled', { isEnabled: filters.isEnabled });
        }

        if (typeof filters?.fromAbsMs === 'number' && Number.isFinite(filters.fromAbsMs)) {
            const fromAbsMs = Math.floor(filters.fromAbsMs);

            qb.andWhere(
                new Brackets((sub) => {
                    sub
                        // recurrent rules: keep them available; later they will be expanded client/server side
                        .where('wmo.rrule IS NOT NULL')
                        // single-shot items that still intersect [fromAbsMs, +inf)
                        .orWhere('(wmo.dtstartUtcMs + wmo.durationMs) >= :fromAbsMs', { fromAbsMs });
                }),
            );
        }

        return qb.getMany();
    }

    async findOne(id: number): Promise<WorkMachineOverrideEntity> {
        const entity = await this.overrideRepo.findOne({ where: { id } });
        if (!entity) {
            throw new NotFoundException(`WorkMachineOverride with id=${id} was not found.`);
        }
        return entity;
    }

    async update(id: number, dto: UpdateWorkMachineOverrideDto): Promise<WorkMachineOverrideEntity> {
        const entity = await this.findOne(id);

        if (dto.typeId != null) {
            await this.ensureTypeExists(dto.typeId);
            entity.typeId = dto.typeId;
        }

        if (dto.cncId != null) entity.cncId = dto.cncId;
        if (dto.dtstartUtcMs != null) entity.dtstartUtcMs = dto.dtstartUtcMs;
        if (dto.durationMs != null) entity.durationMs = dto.durationMs;
        if (dto.rrule !== undefined) entity.rrule = dto.rrule ?? null;
        if (dto.timezone != null) entity.timezone = dto.timezone;
        if (dto.isEnabled != null) entity.isEnabled = dto.isEnabled;
        if (dto.note !== undefined) entity.note = dto.note ?? null;

        await this.overrideRepo.save(entity);
        return this.findOne(id);
    }

    async remove(id: number): Promise<{ deleted: true; id: number }> {
        const entity = await this.findOne(id);
        await this.overrideRepo.remove(entity);
        return { deleted: true, id };
    }

    async createType(dto: CreateWorkMachineOverrideTypeDto): Promise<WorkMachineOverrideTypeEntity> {
        const entity = this.typeRepo.create({
            code: dto.code,
            name: dto.name,
            effect: dto.effect,
            color: dto.color ?? null,
        });

        return this.typeRepo.save(entity);
    }

    async findAllTypes(): Promise<WorkMachineOverrideTypeEntity[]> {
        return this.typeRepo.find({
            order: {
                id: 'ASC',
            },
        });
    }

    async findOneType(id: number): Promise<WorkMachineOverrideTypeEntity> {
        const entity = await this.typeRepo.findOne({ where: { id } });
        if (!entity) {
            throw new NotFoundException(`WorkMachineOverrideType with id=${id} was not found.`);
        }
        return entity;
    }

    async updateType(
        id: number,
        dto: UpdateWorkMachineOverrideTypeDto,
    ): Promise<WorkMachineOverrideTypeEntity> {
        const entity = await this.findOneType(id);

        if (dto.code != null) entity.code = dto.code;
        if (dto.name != null) entity.name = dto.name;
        if (dto.effect != null) entity.effect = dto.effect;
        if (dto.color !== undefined) entity.color = dto.color ?? null;

        return this.typeRepo.save(entity);
    }

    async removeType(id: number): Promise<{ deleted: true; id: number }> {
        const entity = await this.findOneType(id);
        await this.typeRepo.remove(entity);
        return { deleted: true, id };
    }

    private async ensureTypeExists(typeId: number): Promise<void> {
        const exists = await this.typeRepo.exist({ where: { id: typeId } });
        if (!exists) {
            throw new NotFoundException(`WorkMachineOverrideType with id=${typeId} was not found.`);
        }
    }
}
