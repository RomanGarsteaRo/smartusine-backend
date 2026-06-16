import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_config')
export class ApplicationConfigEntity {

    @PrimaryColumn({ type: 'varchar', length: 100, name: 'config_key' })
    configKey!: string;

    @Column({ type: 'json', name: 'config_value' })
    configValue!: unknown;

    @CreateDateColumn({ type: 'datetime', precision: 6, name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'datetime', precision: 6, name: 'updated_at' })
    updatedAt!: Date;
}
