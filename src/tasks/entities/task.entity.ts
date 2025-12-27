/* task.entity.ts */

import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class TaskEntity {

    @PrimaryColumn({ type: 'varchar', length: 64, name: 'id' })
    id!: string; // din JSON: _id.$oid

    @Column({ type: 'int', nullable: true, name: 'pjs_id' })
    pjsId?: number;

    @Column({ type: 'int', nullable: true, name: 'project_no' })
    projectNo?: number;

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true, name: 'job_no' })
    jobNo?: string;

    @Column({ type: 'int', nullable: true, name: 'wca_no' })
    wcaNo?: number;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'wca_name' })
    wcaName?: string;

    @Column({ type: 'varchar', length: 64, nullable: true, name: 'client_no' })
    clientNo?: string;

    @Index()
    @Column({ type: 'varchar', length: 255, nullable: true, name: 'client_name' })
    clientName?: string;

    @Column({ type: 'varchar', length: 128, nullable: true, name: 'part_no' })
    partNo?: string;

    @Column({ type: 'varchar', length: 64, nullable: true, name: 'rev_no' })
    revNo?: string;

    @Column({ type: 'int', nullable: true, name: 'sequence' })
    sequence?: number;

    @Index()
    @Column({ type: 'int', nullable: true, name: 'status' })
    status?: number;

    @Column({ type: 'int', nullable: true, name: 'qty_to_fab' })
    qtyToFab?: number;

    @Column({ type: 'int', nullable: true, name: 'qty_fab' })
    qtyFab?: number;

    @Column({ type: 'int', nullable: true, name: 'progress' })
    progress?: number;

    @Index()
    @Column({ type: 'datetime', nullable: true, name: 'start_date' })
    startDate?: Date | null;

    @Index()
    @Column({ type: 'datetime', nullable: true, name: 'end_date' })
    endDate?: Date | null;

    @Column({ type: 'decimal', precision: 10, scale: 5, nullable: true, name: 'estim_per_part_time' })
    estimPerPartTime?: number | null;

    @Column({ type: 'decimal', precision: 12, scale: 8, nullable: true, name: 'estim_per_part_time_net' })
    estimPerPartTimeNet?: number | null;

    @Column({ type: 'varchar', length: 64, nullable: true, name: 'date_requis' })
    dateRequis?: string | null; // dacă vrei, o poți converti la DATETIME

    @Column({ type: 'varchar', length: 128, nullable: true, name: 'no_comm' })
    noComm?: string | null;

    @Column({ type: 'int', nullable: true, name: 'soum_no' })
    soumNo?: number | null;

    @Column({ type: 'decimal', precision: 12, scale: 8, nullable: true, name: 'fab_time' })
    fabTime?: number | null;

    @Column({ type: 'decimal', precision: 12, scale: 8, nullable: true, name: 'fab_times' })
    fabTimes?: number | null;

    @Column({ type: 'bigint', nullable: true, name: 'timestamp' })
    timestamp?: number | null;

    @Column({ type: 'int', nullable: true, name: 'ord' })
    ord?: number | null;

    @Column({ type: 'int', nullable: true, name: 'stat_task' })
    statTask?: number | null;

    @Column({ type: 'tinyint', width: 1, default: 0, name: 'stat_prod' })
    statProd!: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0, name: 'stat_red' })
    statRed!: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0, name: 'stat_yell' })
    statYell!: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0, name: 'stat_blue' })
    statBlue!: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0, name: 'stat_pink' })
    statPink!: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0, name: 'stat_green' })
    statGreen!: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0, name: 'stat_orange' })
    statOrange!: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0, name: 'stat_white' })
    statWhite!: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'fab_time_setup' })
    fabTimeSetup?: number | null;
}