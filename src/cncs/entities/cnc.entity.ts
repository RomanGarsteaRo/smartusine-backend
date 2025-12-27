import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('cncs')
export class CncEntity {

    @PrimaryColumn({ type: 'varchar', length: 64, name: 'cnc_id' })
    cncId!: string;

    @Index()
    @Column({ type: 'int', nullable: true, name: 'wca_no' })
    wcaNo?: number | null;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'cnc_name' })
    cncName?: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true, name: 'active_axes' })
    activeAxes?: string | null;
}