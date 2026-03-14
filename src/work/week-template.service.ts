import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DowKey, WorkUzineCalendarEntity, WorkWeek } from './entities/week-template.entity';
import { CreateWorkUzineCalendarDto, UpdateWorkUzineCalendarDto } from './dto/week-template.dto';






const DOWS: DowKey[] = ['0','1','2','3','4','5','6'];

function isValidYmd(ymd: string): boolean {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!m) return false;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return false;

    const dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCFullYear() === y && (dt.getUTCMonth() + 1) === mo && dt.getUTCDate() === d;
}

function normalizeYmd(ymd: string, field: string): string {
    const v = (ymd ?? '').trim();
    if (!isValidYmd(v)) throw new BadRequestException(`${field} must be a valid date "YYYY-MM-DD"`);
    return v;
}

function normalizeAndValidateWeek(week: WorkWeek): WorkWeek {
    // ensure all keys exist
    for (const k of DOWS) {
        if (!Array.isArray((week as any)[k])) (week as any)[k] = [];
    }

    // validate each day windows
    for (const k of DOWS) {
        const arr = week[k];

        for (const w of arr) {
            if (!Number.isFinite(w.sMin) || !Number.isFinite(w.eMin)) {
                throw new BadRequestException(`week[${k}] window has non-finite sMin/eMin`);
            }
            if (w.sMin < 0 || w.sMin > 1440 || w.eMin < 0 || w.eMin > 1440) {
                throw new BadRequestException(`week[${k}] window out of range 0..1440`);
            }
            if (w.eMin <= w.sMin) {
                throw new BadRequestException(`week[${k}] window must satisfy eMin > sMin`);
            }
        }

        // sort and check overlaps
        arr.sort((a, b) => a.sMin - b.sMin || a.eMin - b.eMin);

        for (let i = 1; i < arr.length; i++) {
            const prev = arr[i - 1];
            const cur = arr[i];
            if (cur.sMin < prev.eMin) {
                throw new BadRequestException(`week[${k}] windows overlap`);
            }
        }
    }

    return week;
}

function normalizeNote(note?: string | null): string | null {
    if (note === null) return null;
    const v = (note ?? '').trim();
    return v.length ? v : null;
}

function normalizeNullableYmd(ymd: string | null | undefined, field: string): string | null {
    if (ymd === null || ymd === undefined) return null;
    return normalizeYmd(ymd, field);
}

function validateStartEnd(dtstart: string | null, dtend: string | null): void {
    if (dtstart === null && dtend !== null) {
        throw new BadRequestException(`dtend cannot be set when dtstart is null`);
    }

    if (dtstart !== null && dtend !== null && dtend <= dtstart) {
        throw new BadRequestException(`dtend must be > dtstart (using [dtstart, dtend) convention)`);
    }
}






@Injectable()
export class WorkUzineCalendarService {

    constructor(
        @InjectRepository(WorkUzineCalendarEntity)
        private readonly repo: Repository<WorkUzineCalendarEntity>,
    ) {}


    async getActiveForDay(dayYmd: string): Promise<WorkUzineCalendarEntity | null> {
        const D = normalizeYmd(dayYmd.trim(), 'day');
        const row = await this.repo.createQueryBuilder('c')
            .where('c.dtstart IS NOT NULL')
            .andWhere('c.dtstart <= :D', { D })
            .andWhere('(c.dtend IS NULL OR :D < c.dtend)', { D })
            .orderBy('c.dtstart', 'DESC')
            .addOrderBy('c.updatedAt', 'DESC')
            .addOrderBy('c.id', 'DESC')
            .limit(1)
            .getOne();

        return row ?? null;
    }


    /**
     * Dacă dai from/to (YYYY-MM-DD), întoarce doar calendarele care intersectează intervalul [from, to).
     * (dtstart < to) AND (dtend IS NULL OR dtend > from)
     */
    async list(range?: { from?: string; to?: string }): Promise<WorkUzineCalendarEntity[]> {
        const from = range?.from?.trim();
        const to   = range?.to?.trim();

        if (from && to) {
            const fromY = normalizeYmd(from, 'from');
            const toY   = normalizeYmd(to, 'to');
            if (toY <= fromY) throw new BadRequestException(`to must be > from`);

            return this.repo.createQueryBuilder('c')
                .where('c.dtstart IS NOT NULL')
                .andWhere('c.dtstart < :to', { to: toY })
                .andWhere('(c.dtend IS NULL OR c.dtend > :from)', { from: fromY })
                .orderBy('c.dtstart', 'DESC')
                .addOrderBy('c.updatedAt', 'DESC')
                .addOrderBy('c.id', 'DESC')
                .getMany();
        }

        return this.repo.createQueryBuilder('c')
            .orderBy('CASE WHEN c.dtstart IS NULL THEN 1 ELSE 0 END', 'ASC')
            .addOrderBy('c.dtstart', 'DESC')
            .addOrderBy('c.updatedAt', 'DESC')
            .addOrderBy('c.id', 'DESC')
            .getMany();
    }



    async getOne(id: number): Promise<WorkUzineCalendarEntity> {
        const row = await this.repo.findOne({ where: { id } });
        if (!row) throw new NotFoundException(`work_uzine_calendar ${id} not found`);
        return row;
    }



    async create(dto: CreateWorkUzineCalendarDto): Promise<WorkUzineCalendarEntity> {
        const week = normalizeAndValidateWeek(dto.week);
        const dtstart = normalizeNullableYmd(dto.dtstart, 'dtstart');
        const dtend = normalizeNullableYmd(dto.dtend, 'dtend');

        validateStartEnd(dtstart, dtend);

        const row = this.repo.create({
            name: dto.name.trim(),
            note: normalizeNote(dto.note),
            timezone: (dto.timezone?.trim() || 'America/Montreal'),
            week,
            dtstart,
            dtend,
        });

        return this.repo.save(row);
    }



    async update(id: number, dto: UpdateWorkUzineCalendarDto): Promise<WorkUzineCalendarEntity> {
        const row = await this.getOne(id);

        const nextName = dto.name !== undefined ? dto.name.trim() : row.name;
        const nextTz   = dto.timezone !== undefined ? dto.timezone.trim() : row.timezone;
        const nextWeek = dto.week !== undefined ? normalizeAndValidateWeek(dto.week) : row.week;

        const nextStart = dto.dtstart !== undefined
            ? normalizeNullableYmd(dto.dtstart, 'dtstart')
            : row.dtstart;

        const nextEnd = dto.dtend !== undefined
            ? normalizeNullableYmd(dto.dtend, 'dtend')
            : row.dtend;

        validateStartEnd(nextStart, nextEnd);

        row.name = nextName;
        row.timezone = nextTz;
        row.week = nextWeek;
        row.note = dto.note !== undefined ? normalizeNote(dto.note) : row.note;
        row.dtstart = nextStart;
        row.dtend = nextEnd;

        return this.repo.save(row);
    }



    async remove(id: number): Promise<{ ok: true; id: number }> {
        const row = await this.getOne(id);

        const normName = (row.name ?? '').trim().toUpperCase();
        if (normName === 'DEFAULT') {
            throw new BadRequestException(`DEFAULT calendar cannot be deleted`);
        }

        await this.repo.delete(id);
        return { ok: true, id };
    }
}