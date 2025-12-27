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

const cncIdOf = (r: any) => (r?.CncId ?? '').toString().trim();
const tsOf = (r: any) => Number(r?.Timestamp ?? -1);

function keepLatestPerCncId(raw: any[]) {
    const m = new Map<string, any>();
    for (const r of raw) {
        const id = cncIdOf(r);
        if (!id) continue;

        const prev = m.get(id);
        if (!prev || tsOf(r) > tsOf(prev)) m.set(id, r);
    }
    return [...m.values()];
}


async function run() {
    await ds.initialize();
    const repo = ds.getRepository(CncEntity);

    const jsonPath = path.resolve(__dirname, 'cncs.json');
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as any[];

    const rawFiltered = raw.filter(r => !!cncIdOf(r));
    const rawLatest = keepLatestPerCncId(rawFiltered);
    const rows = rawLatest.map(mapRawToCnc);


    console.log('rows in json:', raw.length);
    console.log('with CncId:', rawFiltered.length);
    console.log('unique CncId latest:', rows.length);


    await repo.createQueryBuilder()
        .insert()
        .into(CncEntity)
        .values(rows)
        .orUpdate(
            ['wca_no', 'cnc_name', 'active_axes'],
            ['cnc_id'],
        )
        .execute();

    console.log('✅ seed cncs (minimal) complet');
    await ds.destroy();
}

run().catch(e => { console.error(e); process.exit(1); });