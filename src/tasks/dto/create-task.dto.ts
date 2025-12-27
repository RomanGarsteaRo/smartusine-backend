/* create-task.dto.ts */
import { IsOptional, IsString, IsInt, IsNumber, IsBoolean, IsISO8601 } from 'class-validator';

export class CreateTaskDto {

    @IsOptional() @IsString() id?: string; // Dacă nu trimiți id, îl putem genera în service

    @IsOptional() @IsInt() pjsId?: number;
    @IsOptional() @IsInt() projectNo?: number;
    @IsOptional() @IsString() jobNo?: string;

    @IsOptional() @IsInt() wcaNo?: number;
    @IsOptional() @IsString() wcaName?: string;

    @IsOptional() @IsString() clientNo?: string;
    @IsOptional() @IsString() clientName?: string;

    @IsOptional() @IsString() partNo?: string;
    @IsOptional() @IsString() revNo?: string;

    @IsOptional() @IsInt() sequence?: number;
    @IsOptional() @IsInt() status?: number;

    @IsOptional() @IsInt() qtyToFab?: number;
    @IsOptional() @IsInt() qtyFab?: number;
    @IsOptional() @IsInt() progress?: number;

    // Acceptăm ISO string; în service convertim în Date
    @IsOptional() @IsISO8601() startDate?: string;
    @IsOptional() @IsISO8601() endDate?: string;

    @IsOptional() @IsNumber() estimPerPartTime?: number;
    @IsOptional() @IsNumber() estimPerPartTimeNet?: number;

    @IsOptional() @IsString() dateRequis?: string;
    @IsOptional() @IsString() noComm?: string;

    @IsOptional() @IsInt() soumNo?: number;

    @IsOptional() @IsNumber() fabTime?: number;
    @IsOptional() @IsNumber() fabTimes?: number;

    @IsOptional() @IsNumber() timestamp?: number;
    @IsOptional() @IsInt() ord?: number;
    @IsOptional() @IsInt() statTask?: number;

    @IsOptional() @IsBoolean() statProd?: boolean;
    @IsOptional() @IsBoolean() statRed?: boolean;
    @IsOptional() @IsBoolean() statYell?: boolean;
    @IsOptional() @IsBoolean() statBlue?: boolean;
    @IsOptional() @IsBoolean() statPink?: boolean;
    @IsOptional() @IsBoolean() statGreen?: boolean;
    @IsOptional() @IsBoolean() statOrange?: boolean;
    @IsOptional() @IsBoolean() statWhite?: boolean;

    @IsOptional() @IsNumber() fabTimeSetup?: number;
}