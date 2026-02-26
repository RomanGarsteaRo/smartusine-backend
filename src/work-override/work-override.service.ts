import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OverrideEffect, WorkUzineOverrideEntity, WorkUzineOverrideTypeEntity } from './entities/work-override.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUzineOverrideTypeDto, UpsertUzineOverrideBatchDto } from './dto/work-override.dto';





const MS_PER_DAY = 24 * 60 * 60 * 1000;







@Injectable()
export class WorkDayOverrideService {
    constructor(
        @InjectRepository(WorkUzineOverrideEntity)
        private readonly repo: Repository<WorkUzineOverrideEntity>,

        @InjectRepository(WorkUzineOverrideTypeEntity)
        private readonly typeRepo: Repository<WorkUzineOverrideTypeEntity>,
    ) {}



    /* TYPES */
    /* .............................................................................................................. */
    listTypes(): Promise<WorkUzineOverrideTypeEntity[]> {
        return this.typeRepo.find({ order: { name: 'ASC' } });
    }

    async createType(dto: CreateUzineOverrideTypeDto): Promise<WorkUzineOverrideTypeEntity> {
        const name = (dto.name ?? '').trim();
        if (!name) throw new BadRequestException('name required');

        // effect este validat de class-validator, dar îl “normalizăm” oricum
        const effect = dto.effect as OverrideEffect;

        try {
            return await this.typeRepo.save(this.typeRepo.create({ name, effect }));
        } catch (e: any) {
            // duplicate key etc.
            throw new BadRequestException(`cannot create type '${name}'`);
        }
    }

    async deleteTypeById(id: number): Promise<void> {
        // dacă există overrides cu acest type_id, DB va bloca (RESTRICT)
        const res = await this.typeRepo.delete(id);
        if (!res.affected) throw new NotFoundException(`override_type ${id} not found`);
    }




    /* OVERRIDES */
    /* .............................................................................................................. */


    async listRange(fromAbsMs: number): Promise<WorkUzineOverrideEntity[]> {
        if (!Number.isFinite(fromAbsMs)) {throw new BadRequestException('fromAbsMs required');}
        const from: number = Math.floor(fromAbsMs);

        return this.repo
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.type', 't')
            .where('o.end_abs_ms > :from', { from: String(from) }) // BIGINT safe
            .orderBy('o.start_abs_ms', 'ASC')
            .addOrderBy('o.id', 'ASC')
            .getMany();
    }

    /**
     * Batch save:
     * - dacă item are id => UPDATE
     * - dacă nu => INSERT
     */
    async upsertBatch(dto: UpsertUzineOverrideBatchDto): Promise<WorkUzineOverrideEntity[]> {
        const items = dto.items ?? [];
        if (!items.length) return [];

        // validare business minimă
        for (const x of items) {
            const s = Math.floor(Number(x.startAbsMs));
            const e = Math.floor(Number(x.endAbsMs));
            if (!Number.isFinite(s) || !Number.isFinite(e)) {
                throw new BadRequestException('startAbsMs/endAbsMs must be numbers');
            }
            if (e <= s) {
                throw new BadRequestException('endAbsMs must be > startAbsMs');
            }
        }

        // optional: verificăm că typeId există (altfel FK error)
        // (pt MVP e ok să lași DB să arunce, dar aici e mesaj mai clar)
        const typeIds = Array.from(new Set(items.map(i => i.typeId)));
        const types = await this.typeRepo.findByIds(typeIds as any);
        if (types.length !== typeIds.length) {
            throw new BadRequestException('Some typeId do not exist');
        }

        const toSave = items.map(x =>
            this.repo.create({
                id: x.id,
                typeId: x.typeId,
                startAbsMs: Math.floor(x.startAbsMs),
                endAbsMs: Math.floor(x.endAbsMs),
                name: (x.name ?? null),
                note: (x.note ?? null),
            }),
        );
        return this.repo.save(toSave);
    }


    async deleteById(id: number): Promise<void> {
        const res = await this.repo.delete(id);
        if (!res.affected) throw new NotFoundException(`work_uzine_override ${id} not found`);
    }
}