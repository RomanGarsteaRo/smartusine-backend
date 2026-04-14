import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { Brackets, In, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { SchedulingGateway } from '../web-socket/sheduling.gateway';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { normalizeTaskEndDateInput } from './data/task-end-date';

@Injectable()
export class TasksService {

    constructor(
        @InjectRepository(TaskEntity)
        private readonly repo: Repository<TaskEntity>,
        private readonly ws: SchedulingGateway,
    ) {}





    private parseWcaNos(v?: string | number[]): number[] | null {
        if (!v) return null;

        if (Array.isArray(v)) {
            const nums = v.map(Number).filter(n => Number.isFinite(n));
            return nums.length ? nums : null;
        }

        const nums = String(v)
            .split(',')
            .map(s => Number(s.trim()))
            .filter(n => Number.isFinite(n));

        return nums.length ? nums : null;
    }
    private toDateOrNull(v?: string): Date | null {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    private toSchedulingEndDateOrNull(v?: string | null): Date | null {
        return normalizeTaskEndDateInput(v ?? null);
    }





    async create(dto: CreateTaskDto): Promise<TaskEntity> {
        const id = dto.id?.trim() || randomUUID(); // dacă nu vine id, generăm
        const entity = this.repo.create({
            ...dto,
            id,
            startDate: this.toDateOrNull(dto.startDate),
            endDate: this.toSchedulingEndDateOrNull(dto.endDate),
            parkedLeft: dto.parkedLeft ?? false,
        });
        return this.repo.save(entity);
    }

    async findAll(q: QueryTaskDto): Promise<{ data: TaskEntity[]; total: number }> {
        const qb = this.repo.createQueryBuilder('t');

        if (q.status !== undefined) qb.andWhere('t.status = :status', { status: q.status });
        if (q.clientName) qb.andWhere('t.client_name LIKE :cn', { cn: `%${q.clientName}%` });
        if (q.jobNo) qb.andWhere('t.job_no = :jobNo', { jobNo: q.jobNo });

        if (q.search) {
            qb.andWhere(new Brackets(b => {
                b.where('t.job_no LIKE :s', { s: `%${q.search}%` })
                    .orWhere('t.client_name LIKE :s', { s: `%${q.search}%` });
            }));
        }

        if (q.startFrom) qb.andWhere('t.start_date >= :sf', { sf: new Date(q.startFrom) });
        if (q.startTo) qb.andWhere('t.start_date <= :st', { st: new Date(q.startTo) });


        /* Filtrare pe WCA (single) */
        if (q.wcaNo !== undefined) {
            qb.andWhere('t.wca_no = :wcaNo', { wcaNo: q.wcaNo });
        } else {
        /* Filtrare pe WCA list (IN) */
            const wcaNos = this.parseWcaNos((q as any).wcaNos ?? (q as any).wcaNoIn);
            if (wcaNos?.length) {
                qb.andWhere('t.wca_no IN (:...wcaNos)', { wcaNos });
            }
        }


        qb.orderBy('t.start_date', 'ASC')
            .offset(q.offset ?? 0)
            .limit(q.limit ?? 50);

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }

    async findOne(id: string): Promise<TaskEntity> {
        const found = await this.repo.findOne({ where: { id } });
        if (!found) throw new NotFoundException(`Task ${id} not found`);
        return found;
    }

    async update(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {
        // 1) Citește entitatea existentă
        const existing = await this.findOne(id);

        // 2) Normalizează câmpurile sensibile (ex. date)
        // ".merge" > combina proprietățile unui obiect sursă (dto) peste o entitate existentă "existing" (nu atinge DB).
        // pregăteștim entitatea pentru a fi salvată.
        const patched = this.repo.merge(existing, {
            ...dto,
            startDate: dto.startDate !== undefined ? this.toDateOrNull(dto.startDate) : existing.startDate,
            endDate: dto.endDate !== undefined ? this.toSchedulingEndDateOrNull(dto.endDate) : existing.endDate,
            parkedLeft: dto.parkedLeft !== undefined ? dto.parkedLeft : existing.parkedLeft,
        });

        // 3) Salvează
        const saved = await this.repo.save(patched);

        // 4) Emiteri WS (condițional, ca să nu “spamezi”)
        //    Dacă ORD/WCA/status s-au schimbat → statusChanged
        const ordChanged   = dto.ord      !== undefined && dto.ord      !== existing.ord;
        const wcaChanged   = dto.wcaNo    !== undefined && dto.wcaNo    !== existing.wcaNo;
        const statChanged  = dto.statTask !== undefined && dto.statTask !== existing.statTask;
        const parkedLeftChanged = dto.parkedLeft !== undefined && dto.parkedLeft !== existing.parkedLeft;

        if (ordChanged || wcaChanged || statChanged || parkedLeftChanged) {
            this.ws.emitStatusChanged(saved);
        }

        // “Albastru” – doar dacă s-a trimis câmpul și s-a schimbat efectiv
        const blueChanged = dto.statBlue !== undefined && dto.statBlue !== existing.statBlue;
        if (blueChanged) {
            this.ws.emitStatusBlueChanged();
        }

        // Dacă ai logică de “counter” (ex: mutări între coloane, terminate, etc.)
        // poți lega de anumite câmpuri:
        const affectsCount =
            wcaChanged ||
            (dto.ord !== undefined && dto.ord === -1) || // terminator
            (dto.status !== undefined && dto.status !== existing.status) ||
            parkedLeftChanged;

        if (affectsCount) {
            this.ws.emitCountTasksChanged(saved);
        }

        return saved;
    }

    async upsertMany(rows: CreateTaskDto[]): Promise<void> {
        if (!rows?.length) return;
        const values = rows.map(r => ({
            ...r,
            id: r.id?.trim() || randomUUID(),
            startDate: this.toDateOrNull(r.startDate),
            endDate: this.toSchedulingEndDateOrNull(r.endDate),
            parkedLeft: r.parkedLeft ?? false,
        }));

        await this.repo.createQueryBuilder()
            .insert()
            .into(TaskEntity)
            .values(values as any)
            .orUpdate(
                [
                    'pjs_id','project_no','job_no','wca_no','wca_name','client_no','client_name',
                    'part_no','rev_no','sequence','status','qty_to_fab','qty_fab','progress',
                    'start_date','end_date','estim_per_part_time','estim_per_part_time_net',
                    'date_requis','no_comm','soum_no','fab_time','fab_times','timestamp',
                    'ord','stat_task','stat_prod','stat_red','stat_yell','stat_blue','stat_pink',
                    'stat_green','stat_orange','stat_white','fab_time_setup','parked_left'
                ],
                ['id'],
            )
            .execute();
    }


    async deleteMissingExcept(ids: string[]): Promise<number> {
        const keep = Array.from(new Set((ids ?? []).map(x => String(x ?? '').trim()).filter(Boolean)));
        if (!keep.length) {
            const res = await this.repo.createQueryBuilder().delete().from(TaskEntity).execute();
            return res.affected ?? 0;
        }

        const res = await this.repo.createQueryBuilder()
            .delete()
            .from(TaskEntity)
            .where('id NOT IN (:...keep)', { keep })
            .execute();

        return res.affected ?? 0;
    }

    async countAll(): Promise<number> {
        return this.repo.count();
    }

    async remove(id: string): Promise<void> {
        const res = await this.repo.delete({ id });
        if (!res.affected) throw new NotFoundException(`Task ${id} not found`);
    }

    async updateSchedulingTaskEndDate(id: string, endDate: string | null | undefined): Promise<TaskEntity> {
        const existing = await this.findOne(id);
        existing.endDate = this.toSchedulingEndDateOrNull(endDate ?? null);

        const saved = await this.repo.save(existing);
        this.ws.emitStatusBlueChanged();
        return saved;
    }

    async updateSchedulingTaskDeadline(id: string, deadline: string | null | undefined): Promise<TaskEntity> {
        const existing = await this.findOne(id);
        existing.dateRequis = deadline == null || deadline === '' ? null : String(deadline).trim();

        const saved = await this.repo.save(existing);
        this.ws.emitStatusBlueChanged();
        return saved;
    }

    private toDeadlineSortMs(v: string | null | undefined): number {
        if (!v) return Number.POSITIVE_INFINITY;
        const t = new Date(String(v)).getTime();
        return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
    }

    private compareTasksForDeadlineOrd(a: TaskEntity, b: TaskEntity): number {
        const aInProd = a.statTask === 1 ? 0 : 1;
        const bInProd = b.statTask === 1 ? 0 : 1;
        if (aInProd !== bInProd) return aInProd - bInProd;

        const ad = this.toDeadlineSortMs(a.dateRequis ?? null);
        const bd = this.toDeadlineSortMs(b.dateRequis ?? null);
        if (ad !== bd) return ad - bd;

        const ao = a.ord ?? Number.POSITIVE_INFINITY;
        const bo = b.ord ?? Number.POSITIVE_INFINITY;
        if (ao !== bo) return ao - bo;

        return String(a.id).localeCompare(String(b.id));
    }

    async reorderTasks(dto: ReorderTasksDto): Promise<{ ok: true; updated: number }> {
        /* TODO WcaName nu se actualizeaza. Trebuie sters din entitate ca sa nu mai avem aceste probleme */

        if (!dto?.lanes?.length) {
            throw new BadRequestException('lanes is required');
        }

        const allTaskIds = dto.lanes.flatMap(l => l.taskIds ?? []);
        const uniqueTaskIds = [...new Set(allTaskIds)];

        if (uniqueTaskIds.length !== allTaskIds.length) {
            throw new BadRequestException('Duplicate task ids are not allowed in reorder payload');
        }

        return this.repo.manager.transaction(async manager => {
            const repo = manager.getRepository(TaskEntity);

            const existing = uniqueTaskIds.length
                ? await repo.find({ where: { id: In(uniqueTaskIds) } })
                : [];

            const byId = new Map(existing.map(t => [t.id, t]));

            const missingIds = uniqueTaskIds.filter(id => !byId.has(id));
            if (missingIds.length) {
                throw new BadRequestException(`Tasks not found: ${missingIds.join(', ')}`);
            }

            let updated = 0;

            for (const lane of dto.lanes) {
                const wcaNo = lane.wcaNo;

                for (let i = 0; i < lane.taskIds.length; i++) {
                    const taskId = lane.taskIds[i];
                    const task = byId.get(taskId)!;

                    const wcaChanged = (task.wcaNo ?? null) !== wcaNo;

                    /*
                     * ORD persist is temporarily disabled.
                     * Current business rule:
                     * - visual order in timeline is driven by deadline
                     * - ORD is synchronized only via /scheduling/v2/reorder-by-deadline
                     * Keep the old ORD logic here for easy restore if client direction changes again.
                     *
                     * const nextOrd = i + 1;
                     * const ordChanged = (task.ord ?? null) !== nextOrd;
                     * if (!ordChanged && !wcaChanged) {
                     *     continue;
                     * }
                     *
                     * await repo.update(
                     *     { id: taskId },
                     *     {
                     *         ord: nextOrd,
                     *         wcaNo,
                     *     },
                     * );
                     *
                     * task.ord = nextOrd;
                     * task.wcaNo = wcaNo;
                     * updated++;
                     */

                    if (!wcaChanged) {
                        continue;
                    }

                    await repo.update(
                        { id: taskId },
                        { wcaNo },
                    );

                    task.wcaNo = wcaNo;
                    updated++;
                }
            }

            return { ok: true as const, updated };
        });
    }

    async reorderTasksByDeadline(
        wcaNo: number,
    ): Promise<{ ok: true; wcaNo: number; updated: number; taskIds: string[] }> {

        if (!Number.isFinite(wcaNo)) {
            throw new BadRequestException('wcaNo is required');
        }

        return this.repo.manager.transaction(async manager => {
            const repo = manager.getRepository(TaskEntity);

            const tasks = await repo.find({
                where: { wcaNo },
            });

            if (!tasks.length) {
                return {
                    ok: true as const,
                    wcaNo,
                    updated: 0,
                    taskIds: [],
                };
            }

            const ordered = [...tasks].sort((a, b) => this.compareTasksForDeadlineOrd(a, b));

            let updated = 0;

            for (let i = 0; i < ordered.length; i++) {
                const task = ordered[i];
                const nextOrd = i + 1;

                if ((task.ord ?? null) === nextOrd) continue;

                await repo.update(
                    { id: task.id },
                    { ord: nextOrd },
                );

                task.ord = nextOrd;
                updated++;
            }

            return {
                ok: true as const,
                wcaNo,
                updated,
                taskIds: ordered.map(t => t.id),
            };
        });
    }





}
