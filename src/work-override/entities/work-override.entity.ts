import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';





export enum OverrideEffect {
    OPEN = 'OPEN',
    CLOSE = 'CLOSE',
}

/** MariaDB bigint -> JS number (epoch ms) */
const BigIntMsTransformer = {
    to: (v: number | null | undefined) => (v == null ? null : Math.floor(v)),
    from: (v: string | number | null) => (v == null ? null : Number(v)),
};







@Entity('work_uzine_override_type')
@Index(['name'], { unique: true })
export class WorkUzineOverrideTypeEntity {
    @PrimaryGeneratedColumn({ unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 80 })
    name!: string;

    @Column({ type: 'enum', enum: OverrideEffect })
    effect!: OverrideEffect;

    @CreateDateColumn({ type: 'datetime', name: 'created_at', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'datetime', name: 'updated_at', precision: 6 })
    updatedAt!: Date;
}





@Entity('work_uzine_override')
@Index(['startAbsMs'])
@Index(['endAbsMs'])
export class WorkUzineOverrideEntity {
    @PrimaryGeneratedColumn({ unsigned: true })
    id!: number;

    @Column({ type: 'int', unsigned: true, name: 'type_id' })
    typeId!: number;

    @ManyToOne(() => WorkUzineOverrideTypeEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'type_id' })
    type?: WorkUzineOverrideTypeEntity;

    @Column({
        type: 'bigint',
        unsigned: true,
        name: 'start_abs_ms',
        transformer: BigIntMsTransformer,
    })
    startAbsMs!: number;

    @Column({
        type: 'bigint',
        unsigned: true,
        name: 'end_abs_ms',
        transformer: BigIntMsTransformer,
    })
    endAbsMs!: number;

    @Column({ type: 'varchar', length: 120, nullable: true })
    name!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    note!: string | null;

    @CreateDateColumn({ type: 'datetime', name: 'created_at', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'datetime', name: 'updated_at', precision: 6 })
    updatedAt!: Date;
}