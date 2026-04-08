import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cncs')
export class CncEntity {

    @PrimaryColumn({ type: 'int', name: 'wca_no' })
    wcaNo!: number;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'wca_name' })
    wcaName?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'cnc_name' })
    cncName?: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true, name: 'active_axes' })
    activeAxes?: string | null;
}
