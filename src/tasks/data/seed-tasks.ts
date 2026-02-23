/* seed-tasks.ts */

/*
 *  234 tasks | 23 01 2026  7:15
 *  npm run seed:tasks
 *
 *
 */




import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { mapRawToTask } from './map-task';
import * as fs from 'fs';
import * as path from 'path';
import { TaskEntity } from '../entities/task.entity';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });


const ds = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'usinajfr',
    entities: [TaskEntity],
    synchronize: false, // [true] Doar pentru development si doar pentru crearea tabelului in DB daca nu exista!
});


async function run() {
    await ds.initialize();
    const repo = ds.getRepository(TaskEntity);
    const jsonPath = path.resolve(__dirname, 'tasks.json');
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as any[];
    const rows = raw.map(mapRawToTask);

    // upsert pe cheia primară `id`
    await repo
        .createQueryBuilder()
        .insert()
        .into(TaskEntity)
        .values(rows)
        .orUpdate(
            [
                'pjs_id',
                'project_no',
                'job_no',
                'wca_no',
                'wca_name',
                'client_no',
                'client_name',
                'part_no',
                'rev_no',
                'sequence',
                'status',
                'qty_to_fab',
                'qty_fab',
                'progress',
                'start_date',
                'end_date',
                'estim_per_part_time',
                'estim_per_part_time_net',
                'date_requis',
                'no_comm',
                'soum_no',
                'fab_time',
                'fab_times',
                'timestamp',
                'ord',
                'stat_task',
                'stat_prod',
                'stat_red',
                'stat_yell',
                'stat_blue',
                'stat_pink',
                'stat_green',
                'stat_orange',
                'stat_white',
                'fab_time_setup'
            ],
            ['id']
        )
        .execute();

    console.log('✅ seed complet');
    await ds.destroy();
}
run().catch(e => { console.error(e); process.exit(1); });
