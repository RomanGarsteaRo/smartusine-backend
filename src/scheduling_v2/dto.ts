



export interface SchedulingSnapshotDto {
    generatedAt: number;
    lines: SchedulingLineDto[];
    tasks: SchedulingTaskDto[];
}


export interface SchedulingLineDto {
    wcaNo: number;
    wcaName: string;
    cncName: string;
    activeAxes: string;
    taskIds: string[];
}




export const FLAG_KEYS = [
  'green',
  'orange',
  'red',
  'yell',
  'blue',
  'pink',
  'white',
] as const;

export type FlagKey = typeof FLAG_KEYS[number];
export type SchedulingTaskFlagsDto = Record<FlagKey, boolean>;


export interface SchedulingTaskDto {
  id: string;

  wcaNo: number;
  wcaName: string;

  clientName: string;
  clientNo: string;
  jobNo: string;
  partNo: string;
  projectNo: number;
  revNo: string;

  qty_toMake: number;
  qty_made: number;
  qty_left: number;
  qty_done: number;
  qty_extra: number;
  progress: number;

  fab_cycleNetMs: number;
  fab_setupMs: number;
  fab_workTotalMs: number;
  fab_workLeftMs: number;
  fab_deadlineMs: number | null;

  ord: number;
  status: number;
  flags: SchedulingTaskFlagsDto;
}
