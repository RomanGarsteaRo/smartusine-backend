import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';




export type DowKey = '0'|'1'|'2'|'3'|'4'|'5'|'6';
export interface WorkWindow {
    sMin: number; // minute from midnight [0..1440)
    eMin: number; // minute from midnight (0..1440]
}
export type WorkWeek = Record<DowKey, WorkWindow[]>;




@Entity('work_uzine_calendar')
@Index(['name'])
@Index(['dtstart'])
@Index(['dtend'])
@Index(['dtstart', 'dtend'])
export class WorkUzineCalendarEntity {

    @PrimaryGeneratedColumn({ unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 120 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    note!: string | null;

    @Column({ type: 'varchar', length: 64, default: 'America/Montreal' })
    timezone!: string;

    /**
     * Stored as LONGTEXT in MariaDB via TypeORM (simple-json).
     * Keys: "0".."6"
     * Values: WorkWindow[]
     */
    @Column({ type: 'simple-json', name: 'week' })
    week!: WorkWeek;

    /**
     * Date-only in timezone-ul calendarului. Recomandăm [dtstart, dtend) (dtend exclusiv).
     * Format: "YYYY-MM-DD"
     */
    @Column({ type: 'date', name: 'dtstart' })
    dtstart!: string;

    @Column({ type: 'date', name: 'dtend', nullable: true })
    dtend!: string | null;

    @CreateDateColumn({ type: 'datetime', name: 'created_at', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'datetime', name: 'updated_at', precision: 6 })
    updatedAt!: Date;
}