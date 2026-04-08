import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CncEntity } from './entities/cnc.entity';
import { Brackets, Not, Repository } from 'typeorm';
import { CreateCncDto } from './dto/create-cnc.dto';
import { QueryCncDto } from './dto/query-cnc.dto';
import { UpdateCncDto } from './dto/update-cnc.dto';

export type CncSummary = Pick<CncEntity, 'wcaNo' | 'wcaName' | 'cncName' | 'activeAxes'>;

@Injectable()
export class CncsService {

    constructor(
        @InjectRepository(CncEntity)
        private readonly repo: Repository<CncEntity>,
    ) {}

    async create(dto: CreateCncDto): Promise<CncEntity> {
        const entity = this.repo.create({
            wcaNo: dto.wcaNo,
            wcaName: dto.wcaName ?? null,
            cncName: dto.cncName ?? null,
            activeAxes: dto.activeAxes ?? null,
        });

        return this.repo.save(entity);
    }

    async findAll(q: QueryCncDto): Promise<{ data: CncEntity[]; total: number }> {
        const qb = this.repo.createQueryBuilder('c');

        if (q.wcaNo !== undefined) qb.andWhere('c.wca_no = :wcaNo', { wcaNo: q.wcaNo });

        if (q.search) {
            qb.andWhere(new Brackets(b => {
                b.where('c.wca_name LIKE :s', { s: `%${q.search}%` })
                    .orWhere('c.cnc_name LIKE :s', { s: `%${q.search}%` });
            }));
        }

        qb.orderBy('c.wca_no', 'ASC')
            .addOrderBy('c.cnc_name', 'ASC')
            .offset(q.offset ?? 0)
            .limit(q.limit ?? 50);

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }

    async summary(): Promise<CncSummary[]> {
        return this.repo.find({
            select: { wcaNo: true, wcaName: true, cncName: true, activeAxes: true },
            where: { wcaNo: Not(0) },
            order: { wcaNo: 'ASC', cncName: 'ASC' },
        });
    }

    async findOne(wcaNo: number): Promise<CncEntity> {
        const found = await this.repo.findOne({ where: { wcaNo } });
        if (!found) throw new NotFoundException(`CNC/WCA ${wcaNo} not found`);
        return found;
    }

    async update(wcaNo: number, dto: UpdateCncDto): Promise<CncEntity> {
        const existing = await this.findOne(wcaNo);
        const patched = this.repo.merge(existing, {
            wcaName: dto.wcaName !== undefined ? dto.wcaName : existing.wcaName,
            cncName: dto.cncName !== undefined ? dto.cncName : existing.cncName,
            activeAxes: dto.activeAxes !== undefined ? dto.activeAxes : existing.activeAxes,
        });
        return this.repo.save(patched);
    }

    async upsertMany(rows: CreateCncDto[]): Promise<void> {
        if (!rows?.length) return;

        const values = rows
            .map(r => ({
                wcaNo: r.wcaNo,
                wcaName: r.wcaName ?? null,
                cncName: r.cncName ?? null,
                activeAxes: r.activeAxes ?? null,
            }))
            .filter(v => Number.isFinite(v.wcaNo));

        if (!values.length) return;

        await this.repo.createQueryBuilder()
            .insert()
            .into(CncEntity)
            .values(values as any)
            .orUpdate(['wca_name', 'cnc_name', 'active_axes'], ['wca_no'])
            .execute();
    }

    async deleteMissingExcept(wcaNos: number[]): Promise<number> {
        const keep = Array.from(new Set((wcaNos ?? []).filter((v): v is number => Number.isFinite(v))));
        if (!keep.length) {
            const res = await this.repo.createQueryBuilder().delete().from(CncEntity).execute();
            return res.affected ?? 0;
        }

        const res = await this.repo.createQueryBuilder()
            .delete()
            .from(CncEntity)
            .where('wca_no NOT IN (:...keep)', { keep })
            .execute();

        return res.affected ?? 0;
    }

    async countAll(): Promise<number> {
        return this.repo.count();
    }

    async remove(wcaNo: number): Promise<void> {
        const res = await this.repo.delete({ wcaNo });
        if (!res.affected) throw new NotFoundException(`CNC/WCA ${wcaNo} not found`);
    }
}
