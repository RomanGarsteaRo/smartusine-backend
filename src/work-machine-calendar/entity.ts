import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';



/*  DB SQL
 *  ...........................................................................................

CREATE TABLE `work_machine_calendar` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NULL,
  `note` text NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'America/Montreal',
  `cnc` longtext NOT NULL,
  `week` longtext NOT NULL,
  `dtstart` date NULL,
  `dtend` date NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `IDX_work_machine_calendar_name` (`name`),
  KEY `IDX_work_machine_calendar_dtstart` (`dtstart`),
  KEY `IDX_work_machine_calendar_dtend` (`dtend`),
  KEY `IDX_work_machine_calendar_dtstart_dtend` (`dtstart`, `dtend`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  ............................................................................................ */


export type WorkWeek = Record<DowKey, WorkWindow[]>;
export type DowKey = '0' | '1' | '2' | '3' | '4' | '5' | '6';
export interface WorkWindow {
    sMin: number; /* minute from midnight [0..1440) */
    eMin: number; /* minute from midnight (0..1440] */
}



@Entity('work_machine_calendar')
@Index(['name'])
@Index(['dtstart'])
@Index(['dtend'])
@Index(['dtstart', 'dtend'])
export class WorkMachineCalendarEntity {

    @PrimaryGeneratedColumn({ unsigned: true })
    id!: number;

    @Column({ type: 'varchar', nullable: true, length: 120 })
    name!: string | null;
    @Column({ type: 'text', nullable: true })
    note!: string | null;


    @Column({ type: 'simple-json', name: 'cnc' })
    cnc!: string[];


    @Column({ type: 'simple-json', name: 'week' })
    week!: WorkWeek;
    @Column({ type: 'date', name: 'dtstart', nullable: true })
    dtstart!: string | null;
    @Column({ type: 'date', name: 'dtend', nullable: true })
    dtend!: string | null;
    @Column({ type: 'varchar', length: 64, default: 'America/Montreal' })
    timezone!: string;


    @CreateDateColumn({ type: 'datetime', name: 'created_at', precision: 6 })
    createdAt!: Date;
    @UpdateDateColumn({ type: 'datetime', name: 'updated_at', precision: 6 })
    updatedAt!: Date;
}