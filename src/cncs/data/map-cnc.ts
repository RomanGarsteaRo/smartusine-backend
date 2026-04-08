type Raw = Record<string, any>;

const toNum = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
const toStr = (v: any) => (v === null || v === undefined ? null : String(v));

export function mapRawToCnc(raw: Raw) {
    return {
        wcaNo: toNum(raw?.WCA_NO) ?? undefined,
        wcaName: toStr(raw?.WCA_NAME),
        cncName: toStr(raw?.CncName),
        activeAxes: toStr(raw?.activeaxes ?? raw?.ActiveAxes?.activeaxes),
    };
}
