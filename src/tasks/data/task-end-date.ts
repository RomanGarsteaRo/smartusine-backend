const MIN_VALID_TASK_END_DATE_UTC_MS = Date.UTC(2020, 0, 1, 0, 0, 0, 0);

export function normalizeTaskEndDateInput(v: unknown): Date | null {
    if (v === null || v === undefined || v === '') return null;

    const d = v instanceof Date ? new Date(v.getTime()) : new Date(String(v));
    const t = d.getTime();

    if (!Number.isFinite(t)) return null;

    // ERP / remote sync sometimes leaks sentinel dates like 1899-12-29 / 1899-12-30.
    // Treat anything unrealistically old as "no placed end date".
    if (t < MIN_VALID_TASK_END_DATE_UTC_MS) return null;

    return d;
}

export function taskEndDateToEpochMs(v: unknown): number | null {
    return normalizeTaskEndDateInput(v)?.getTime() ?? null;
}
