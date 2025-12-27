import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { Brackets, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { SchedulingGateway } from '../web-socket/sheduling.gateway';

@Injectable()
export class TasksService {

    constructor(
        @InjectRepository(TaskEntity)
        private readonly repo: Repository<TaskEntity>,
        private readonly ws: SchedulingGateway,
    ) {}

    private toDateOrNull(v?: string): Date | null {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    async create(dto: CreateTaskDto): Promise<TaskEntity> {
        const id = dto.id?.trim() || randomUUID(); // dacă nu vine id, generăm
        const entity = this.repo.create({
            ...dto,
            id,
            startDate: this.toDateOrNull(dto.startDate),
            endDate: this.toDateOrNull(dto.endDate),
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
            endDate: dto.endDate !== undefined ? this.toDateOrNull(dto.endDate) : existing.endDate,
        });

        // 3) Salvează
        const saved = await this.repo.save(patched);

        // 4) Emiteri WS (condițional, ca să nu “spamezi”)
        //    Dacă ORD/WCA/status s-au schimbat → statusChanged
        const ordChanged   = dto.ord      !== undefined && dto.ord      !== existing.ord;
        const wcaChanged   = dto.wcaNo    !== undefined && dto.wcaNo    !== existing.wcaNo;
        const statChanged  = dto.statTask !== undefined && dto.statTask !== existing.statTask;

        if (ordChanged || wcaChanged || statChanged) {
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
            (dto.status !== undefined && dto.status !== existing.status);

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
            endDate: this.toDateOrNull(r.endDate),
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
                    'stat_green','stat_orange','stat_white','fab_time_setup'
                ],
                ['id'],
            )
            .execute();
    }

    async remove(id: string): Promise<void> {
        const res = await this.repo.delete({ id });
        if (!res.affected) throw new NotFoundException(`Task ${id} not found`);
    }




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

}
