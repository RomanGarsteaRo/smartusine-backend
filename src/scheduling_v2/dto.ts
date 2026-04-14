import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
  fab_endDateMs: number | null;
  parkedLeft: boolean;

  ord: number;
  status: number;
  flags: SchedulingTaskFlagsDto;
}


export class SchedulingReorderLaneDto {
    @IsOptional()
    @IsString()
    cncId?: string;

    @IsInt()
    wcaNo!: number;

    @IsArray()
    @ArrayMinSize(0)
    @IsString({ each: true })
    taskIds!: string[];
}

export class SchedulingReorderTasksDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => SchedulingReorderLaneDto)
    lanes!: SchedulingReorderLaneDto[];
}

export class SchedulingUpdateEndDateDto {
    @IsString()
    id!: string;

    @IsOptional()
    @IsString()
    endDate?: string | null;
}

export class SchedulingUpdateDeadlineDto {
    @IsString()
    id!: string;

    @IsOptional()
    @IsString()
    deadline?: string | null;
}

export class SchedulingReorderByDeadlineDto {
    @IsInt()
    wcaNo!: number;
}