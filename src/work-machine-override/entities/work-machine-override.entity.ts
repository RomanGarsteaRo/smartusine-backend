import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ValueTransformer,
} from 'typeorm';
import { WorkMachineOverrideTypeEntity } from './work-machine-override-type.entity';

const bigintNumberTransformer: ValueTransformer = {
    to: (value?: number | null) => value ?? null,
    from: (value?: string | null) => (value == null ? null : Number(value)),
};

@Entity('work_machine_override')
export class WorkMachineOverrideEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ name: 'cnc_id', type: 'varchar', length: 64 })
    cncId!: string;

    @Column({ name: 'type_id', type: 'int', unsigned: true })
    typeId!: number;

    @ManyToOne(() => WorkMachineOverrideTypeEntity, (type) => type.overrides, {
        nullable: false,
        onDelete: 'RESTRICT',
        eager: true,
    })
    @JoinColumn({ name: 'type_id' })
    type!: WorkMachineOverrideTypeEntity;

    @Column({
        name: 'dtstart_utc_ms',
        type: 'bigint',
        transformer: bigintNumberTransformer,
    })
    dtstartUtcMs!: number;

    @Column({
        name: 'duration_ms',
        type: 'bigint',
        transformer: bigintNumberTransformer,
    })
    durationMs!: number;

    @Column({ type: 'text', nullable: true })
    rrule!: string | null;

    @Column({ type: 'varchar', length: 64, default: 'America/Montreal' })
    timezone!: string;

    @Column({ name: 'is_enabled', type: 'boolean', default: true })
    isEnabled!: boolean;

    @Column({ type: 'text', nullable: true })
    note!: string | null;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'datetime',
        precision: 6,
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    updatedAt!: Date;
}
