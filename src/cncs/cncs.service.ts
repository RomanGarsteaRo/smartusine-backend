import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CncEntity } from './entities/cnc.entity';
import { Brackets, IsNull, Not, Repository } from 'typeorm';
import { CreateCncDto } from './dto/create-cnc.dto';
import { QueryCncDto } from './dto/query-cnc.dto';
import { UpdateCncDto } from './dto/update-cnc.dto';

export type CncSummary = Pick<CncEntity, 'cncId' | 'wcaNo' | 'cncName' | 'activeAxes'>;

@Injectable()
export class CncsService {

    constructor(
        @InjectRepository(CncEntity)
        private readonly repo: Repository<CncEntity>,
    ) {}

    async create(dto: CreateCncDto): Promise<CncEntity> {
        // cncId e PK, deci trebuie să existe
        const cncId = (dto.cncId ?? '').toString().trim();
        if (!cncId) throw new Error('cncId is required');

        const entity = this.repo.create({
            cncId,
            wcaNo: dto.wcaNo ?? null,
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
                b.where('c.cnc_name LIKE :s', { s: `%${q.search}%` })
                    .orWhere('c.cnc_id LIKE :s', { s: `%${q.search}%` });
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
        // Pentru scheduling: doar CNC-uri mapate la WCA (wcaNo != null)
        return this.repo.find({
            select: { cncId: true, wcaNo: true, cncName: true, activeAxes: true },
            where: { wcaNo: Not(IsNull()) },
            order: { wcaNo: 'ASC', cncName: 'ASC' },
        });
    }

    async findOne(cncId: string): Promise<CncEntity> {
        const id = (cncId ?? '').toString().trim();
        const found = await this.repo.findOne({ where: { cncId: id } });
        if (!found) throw new NotFoundException(`CNC ${id} not found`);
        return found;
    }

    async update(cncId: string, dto: UpdateCncDto): Promise<CncEntity> {
        const existing = await this.findOne(cncId);
        const patched = this.repo.merge(existing, {
            wcaNo: dto.wcaNo !== undefined ? dto.wcaNo : existing.wcaNo,
            cncName: dto.cncName !== undefined ? dto.cncName : existing.cncName,
            activeAxes: dto.activeAxes !== undefined ? dto.activeAxes : existing.activeAxes,
        });
        return this.repo.save(patched);
    }

    async upsertMany(rows: CreateCncDto[]): Promise<void> {
        if (!rows?.length) return;

        const values = rows
            .map(r => ({
                cncId: (r.cncId ?? '').toString().trim(),
                wcaNo: r.wcaNo ?? null,
                cncName: r.cncName ?? null,
                activeAxes: r.activeAxes ?? null,
            }))
            .filter(v => !!v.cncId);

        if (!values.length) return;

        await this.repo.createQueryBuilder()
            .insert()
            .into(CncEntity)
            .values(values as any)
            .orUpdate(['wca_no', 'cnc_name', 'active_axes'], ['cnc_id'])
            .execute();
    }

    async remove(cncId: string): Promise<void> {
        const id = (cncId ?? '').toString().trim();
        const res = await this.repo.delete({ cncId: id });
        if (!res.affected) throw new NotFoundException(`CNC ${id} not found`);
    }
}