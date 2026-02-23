/* map-task.ts */
type Raw = Record<string, any>;

const oid = (raw: Raw) => raw?._id?.$oid ? String(raw._id.$oid) : String(raw._id ?? '');
const toNum = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
const toBool = (v: any) => !!v;
const toDateOrNull = (v: any): Date | null => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
};

/******************************************************************************
JSON original	            Entitate TS (proprietate)	Coloană DB (name)
 ............................................................................
_id.$oid	                id (sau taskId)	            id (sau task_id)
PJS_ID	                    pjsId	                    pjs_id
PROJECT_NO	                projectNo	                project_no
JOB_NO	                    jobNo	                    job_no
WCA_NO	                    wcaNo	                    wca_no
WCA_NAME	                wcaName	                    wca_name
CLIENT_NO	                clientNo	                client_no
CLIENT_NAME	                clientName	                client_name
PART_NO	                    partNo	                    part_no
REV_NO	                    revNo	                    rev_no
SEQUENCE	                sequence	                sequence
STATUS	                    status	                    status

QTY_TO_FAB	                qtyToFab	                qty_to_fab
QTY_FAB	                    qtyFab	                    qty_fab
PROGRESS	                progress	                progress

START_DATE	                startDate	                start_date
END_DATE	                endDate	                    end_date

ESTIM_PER_PART_TIME	        estimPerPartTime	        estim_per_part_time
ESTIM_PER_PART_TIME_NET	    estimPerPartTimeNet	        estim_per_part_time_net

Date requis	                dateRequis	                date_requis

N° Comm	                    noComm	                    no_comm
SOUM_NO	                    soumNo	                    soum_no

FAB_TIME	                fabTime	                    fab_time
FAB_TIMES	                fabTimes	                fab_times
FAB_TIME_SETUP	            fabTimeSetup	            fab_time_setup
timestamp	                timestamp	                timestamp

ORD	                        ord	                        ord
StatTask	                statTask	                stat_task
StatProd	                statProd	                stat_prod
StatRed	                    statRed	                    stat_red
StatYell	                statYell	                stat_yell
StatBlue	                statBlue	                stat_blue
StatPink	                statPink	                stat_pink
StatGreen	                statGreen	                stat_green
StatOrange	                statOrange	                stat_orange
StatWhite	                statWhite	                stat_white

*******************************************************************************/

export function mapRawToTask(raw: Raw) {
    return {
        id: oid(raw),

        pjsId: toNum(raw.PJS_ID) ?? undefined,
        projectNo: toNum(raw.PROJECT_NO) ?? undefined,
        jobNo: raw.JOB_NO ?? undefined,
        wcaNo: toNum(raw.WCA_NO) ?? undefined,
        wcaName: raw.WCA_NAME ?? undefined,
        clientNo: raw.CLIENT_NO ?? undefined,
        clientName: raw.CLIENT_NAME ?? undefined,
        partNo: raw.PART_NO ?? undefined,
        revNo: raw.REV_NO ?? undefined,
        sequence: toNum(raw.SEQUENCE) ?? undefined,
        status: toNum(raw.STATUS) ?? undefined,

        qtyToFab: toNum(raw.QTY_TO_FAB) ?? undefined,
        qtyFab: toNum(raw.QTY_FAB) ?? undefined,
        progress: toNum(raw.PROGRESS) ?? undefined,

        startDate: toDateOrNull(raw.START_DATE),
        endDate: toDateOrNull(raw.END_DATE),

        estimPerPartTime: raw.ESTIM_PER_PART_TIME ?? null,
        estimPerPartTimeNet: raw.ESTIM_PER_PART_TIME_NET ?? null,

        dateRequis: raw['Date requis'] ?? null,
        noComm: raw['N° Comm'] ?? null,

        soumNo: toNum(raw.SOUM_NO) ?? null,
        fabTime: raw.FAB_TIME ?? null,
        fabTimes: raw.FAB_TIMES ?? null,

        timestamp: toNum(raw.timestamp) ?? null,
        ord: toNum(raw.ORD) ?? null,
        statTask: toNum(raw.StatTask) ?? null,

        statProd: toBool(raw.StatProd),
        statRed: toBool(raw.StatRed),
        statYell: toBool(raw.StatYell),
        statBlue: toBool(raw.StatBlue),
        statPink: toBool(raw.StatPink),
        statGreen: toBool(raw.StatGreen),
        statOrange: toBool(raw.StatOrange),
        statWhite: toBool(raw.StatWhite),

        fabTimeSetup: toNum(raw.FAB_TIME_SETUP) ?? null,
    };
}