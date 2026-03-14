import { WorkMachineCalendarEntity } from './entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkMachineCalendarDto, UpdateWorkMachineCalendarDto } from './dto';












function isValidYmd(ymd: string): boolean {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!m) return false;

    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);

    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
        return false;
    }

    const dt = new Date(Date.UTC(y, mo - 1, d));
    return (
        dt.getUTCFullYear() === y &&
        dt.getUTCMonth() + 1 === mo &&
        dt.getUTCDate() === d
    );
}

function normalizeYmd(ymd: string, field: string): string {
    const v = (ymd ?? '').trim();
    if (!isValidYmd(v)) {
        throw new BadRequestException(`${field} must be a valid date "YYYY-MM-DD"`);
    }
    return v;
}

function normalizeNullableYmd(
    ymd: string | null | undefined,
    field: string,
): string | null {
    if (ymd === null || ymd === undefined) return null;
    return normalizeYmd(ymd, field);
}

function normalizeStr(note?: string | null): string | null {
    if (note === null) return null;
    const v = (note ?? '').trim();
    return v.length ? v : null;
}

function validateStartEnd(dtstart: string | null, dtend: string | null): void {
    if (dtstart === null && dtend !== null) {
        throw new BadRequestException(`dtend cannot be set when dtstart is null`);
    }

    if (dtstart !== null && dtend !== null && dtend <= dtstart) {
        throw new BadRequestException(
            `dtend must be > dtstart (using [dtstart, dtend) convention)`,
        );
    }
}

function normalizeCncIds(cnc: string[] | undefined): string[] {
    if (cnc === undefined || cnc === null) {
        return [];
    }

    if (!Array.isArray(cnc)) {
        throw new BadRequestException(`cnc must be an array`);
    }

    const normalized = cnc
        .map(v => (v ?? '').trim())
        .filter(v => v.length > 0);

    return Array.from(new Set(normalized));
}










@Injectable()
export class WorkMachineCalendarService {


    constructor(
        @InjectRepository(WorkMachineCalendarEntity)
        private readonly repo: Repository<WorkMachineCalendarEntity>,
    ) {}



    async getActiveForDay(dayYmd: string, cncId: string): Promise<WorkMachineCalendarEntity | null> {
        const D = normalizeYmd(dayYmd.trim(), 'day');
        const cnc = (cncId ?? '').trim();

        if (!cnc) {
            throw new BadRequestException(`cncId is required`);
        }

        const rows = await this.repo.createQueryBuilder('c')
            .where('c.dtstart IS NOT NULL')
            .andWhere('c.dtstart <= :D', { D })
            .andWhere('(c.dtend IS NULL OR :D < c.dtend)', { D })
            .orderBy('c.dtstart', 'DESC')
            .addOrderBy('c.updatedAt', 'DESC')
            .addOrderBy('c.id', 'DESC')
            .getMany();

        return rows.find(r => Array.isArray(r.cnc) && r.cnc.includes(cnc)) ?? null;
    }

    /**
     * Dacă dai from/to => întoarce calendarele care intersectează [from, to)
     * Opțional filtrează și după cncId.
     */
    async list(range?: {
        from?: string;
        to?: string;
        cncId?: string;
    }): Promise<WorkMachineCalendarEntity[]> {
        const from = range?.from?.trim();
        const to = range?.to?.trim();
        const cncId = range?.cncId?.trim();

        let rows: WorkMachineCalendarEntity[];

        if (from && to) {
            const fromY = normalizeYmd(from, 'from');
            const toY = normalizeYmd(to, 'to');

            if (toY <= fromY) {
                throw new BadRequestException(`to must be > from`);
            }

            rows = await this.repo.createQueryBuilder('c')
                .where('c.dtstart IS NOT NULL')
                .andWhere('c.dtstart < :to', { to: toY })
                .andWhere('(c.dtend IS NULL OR c.dtend > :from)', { from: fromY })
                .orderBy('c.dtstart', 'DESC')
                .addOrderBy('c.updatedAt', 'DESC')
                .addOrderBy('c.id', 'DESC')
                .getMany();
        } else {
            rows = await this.repo.createQueryBuilder('c')
                .orderBy('CASE WHEN c.dtstart IS NULL THEN 1 ELSE 0 END', 'ASC')
                .addOrderBy('c.dtstart', 'DESC')
                .addOrderBy('c.updatedAt', 'DESC')
                .addOrderBy('c.id', 'DESC')
                .getMany();
        }

        if (!cncId) return rows;

        return rows.filter(r => Array.isArray(r.cnc) && r.cnc.includes(cncId));
    }

    async getOne(id: number): Promise<WorkMachineCalendarEntity> {
        const row = await this.repo.findOne({ where: { id } });
        if (!row) {
            throw new NotFoundException(`work_machine_calendar ${id} not found`);
        }
        return row;
    }

    async create(dto: CreateWorkMachineCalendarDto): Promise<WorkMachineCalendarEntity> {
        const week = {...dto.week};
        const dtstart = normalizeNullableYmd(dto.dtstart, 'dtstart');
        const dtend = normalizeNullableYmd(dto.dtend, 'dtend');
        const cnc = normalizeCncIds(dto.cnc);

        validateStartEnd(dtstart, dtend);

        const row = this.repo.create({
            name: normalizeStr(dto.name),
            note: normalizeStr(dto.note),
            timezone: (dto.timezone?.trim() || 'America/Montreal'),
            cnc,
            week,
            dtstart,
            dtend,
        });

        return this.repo.save(row);
    }

    async update(id: number, dto: UpdateWorkMachineCalendarDto): Promise<WorkMachineCalendarEntity> {
        const row = await this.getOne(id);

        const nextName = dto.name === '' ? null : normalizeStr(dto.name);
        const nextTz = dto.timezone !== undefined ? dto.timezone.trim() : row.timezone;
        const nextWeek = dto.week !== undefined ? {...dto.week} : row.week;

        const nextStart = dto.dtstart !== undefined
            ? normalizeNullableYmd(dto.dtstart, 'dtstart')
            : row.dtstart;

        const nextEnd = dto.dtend !== undefined
            ? normalizeNullableYmd(dto.dtend, 'dtend')
            : row.dtend;

        const nextCnc = dto.cnc !== undefined
            ? normalizeCncIds(dto.cnc)
            : row.cnc;

        validateStartEnd(nextStart, nextEnd);

        row.name = nextName;
        row.note = dto.note !== undefined ? normalizeStr(dto.note) : row.note;
        row.timezone = nextTz;
        row.cnc = nextCnc;
        row.week = nextWeek;
        row.dtstart = nextStart;
        row.dtend = nextEnd;

        return this.repo.save(row);
    }

    async remove(id: number): Promise<{ ok: true; id: number }> {
        const row = await this.getOne(id);
        await this.repo.delete(id);
        return { ok: true, id };
    }
}