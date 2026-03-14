import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { WorkMachineOverrideEntity } from './work-machine-override.entity';

export enum WorkMachineOverrideEffect {
    OPEN = 'OPEN',
    CLOSE = 'CLOSE',
}

@Entity('work_machine_override_type')
@Unique('UQ_wmo_type_code', ['code'])
export class WorkMachineOverrideTypeEntity {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 64 })
    code!: string;

    @Column({ type: 'varchar', length: 120 })
    name!: string;

    @Column({
        type: 'enum',
        enum: WorkMachineOverrideEffect,
    })
    effect!: WorkMachineOverrideEffect;

    @Column({ type: 'varchar', length: 32, nullable: true })
    color!: string | null;

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

    @OneToMany(() => WorkMachineOverrideEntity, (override) => override.type)
    overrides!: WorkMachineOverrideEntity[];
}
