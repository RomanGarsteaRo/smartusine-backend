import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Stores local scheduling state for a task.
 *
 * We intentionally keep this data outside of the main TaskEntity because
 * tasks may be imported or used by other applications. Adding scheduler-specific
 * fields directly to TaskEntity could break existing integrations.
 *
 * This table extends a task by taskId and contains only Work Calendar specific
 * properties, such as urgencyLevel.
 */



@Entity('scheduling_task_state')
export class SchedulingTaskStateEntity {

    @PrimaryColumn({ type: 'varchar', length: 64, name: 'task_id' })
    taskId!: string;

    @Column({ type: 'tinyint', default: 0, name: 'urgency_level' })
    urgencyLevel!: number;

    @CreateDateColumn({ type: 'datetime', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
    updatedAt!: Date;
}
