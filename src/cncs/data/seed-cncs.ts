import { CncEntity } from '../entities/cnc.entity';
import { DataSource } from 'typeorm';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { mapRawToCnc } from './map-cnc';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

const ds = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'usinajfr',
    entities: [CncEntity],
    synchronize: false,
});

const wcaNoOf = (r: any) => Number(r?.WCA_NO ?? NaN);

function keepLatestPerWcaNo(raw: any[]) {
    const m = new Map<number, any>();
    for (const r of raw) {
        const wcaNo = wcaNoOf(r);
        if (!Number.isFinite(wcaNo)) continue;
        m.set(wcaNo, r);
    }
    return [...m.values()];
}

async function run() {
    await ds.initialize();
    const repo = ds.getRepository(CncEntity);

    const jsonPath = path.resolve(__dirname, 'cncs.json');
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as any[];

    const rawFiltered = raw.filter(r => Number.isFinite(wcaNoOf(r)));
    const rawLatest = keepLatestPerWcaNo(rawFiltered);
    const rows = rawLatest.map(mapRawToCnc);

    console.log('rows in json:', raw.length);
    console.log('with WCA_NO:', rawFiltered.length);
    console.log('unique WCA_NO:', rows.length);

    await repo.createQueryBuilder()
        .insert()
        .into(CncEntity)
        .values(rows)
        .orUpdate(
            ['wca_name', 'cnc_name', 'active_axes'],
            ['wca_no'],
        )
        .execute();

    console.log('✅ seed cncs complet');
    await ds.destroy();
}

run().catch(e => { console.error(e); process.exit(1); });
