import { ConfigService } from '@nestjs/config';

export type SchedulingSourceMode = 'db' | 'remote';

export function getSchedulingSourceMode(config: ConfigService): SchedulingSourceMode {
    const raw = (config.get<string>('SCHEDULING_SOURCE') ?? 'db').trim().toLowerCase();
    return raw === 'remote' ? 'remote' : 'db';
}

export function getSchedulingRemoteTasksUrl(config: ConfigService): string {
    return (config.get<string>('SCHEDULING_REMOTE_TASKS_URL') ?? 'http://10.0.0.62:1880/usinage/all_jobs').trim();
}

export function getSchedulingRemoteWcasUrl(config: ConfigService): string {
    return (config.get<string>('SCHEDULING_REMOTE_WCAS_URL') ?? 'http://10.0.0.62:1880/usinage/all_wca').trim();
}

export function getSchedulingRemoteTimeoutMs(config: ConfigService): number {
    const raw = Number(config.get<string>('SCHEDULING_REMOTE_TIMEOUT_MS') ?? '15000');
    return Number.isFinite(raw) && raw > 0 ? raw : 15000;
}



/*  .env.dev   SCHEDULING_SOURCE  =  'db'  | 'remote'
 *                                    DEV     PROD
 *  .......................................................
 *      -SCHEDULING_SOURCE=db
 *          snapshot-ul citește din DB local
 *      -SCHEDULING_SOURCE=remote
 *          snapshot-ul citește direct din endpoint-urile clientului
 *      -POST /dev/sync/scheduling
 *          copiază datele din remote în DB-ul tău
 *      -GET /dev/sync/status
 *          îți arată în ce regim ești și câte date ai local
 *
 *
 *
 *
 *
 *   PowerShell GET status
 *   .......................................................
 *   Invoke-RestMethod http://localhost:3000/dev/sync/status
 *
 *
 *
 *
 *   PowerShell POST sync
 *   .......................................................
 *   Invoke-RestMethod `
 *       -Method POST `
 *       -Uri http://localhost:3000/dev/sync/scheduling `
 *       -ContentType "application/json" `
 *       -Body '{"replaceTasks":true,"replaceCncs":true}'
 *
 *
 *
 */