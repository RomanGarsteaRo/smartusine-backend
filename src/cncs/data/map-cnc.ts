type Raw = Record<string, any>;

const toNum = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
const toStr = (v: any) => (v === null || v === undefined ? null : String(v));

export function mapRawToCnc(raw: Raw) {
    return {
        cncId: String(raw?.CncId ?? '').trim(),
        wcaNo: toNum(raw?.WCA_NO),
        cncName: toStr(raw?.CncName),
        activeAxes: toStr(raw?.ActiveAxes?.activeaxes),
    };
}
