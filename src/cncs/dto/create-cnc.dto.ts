import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCncDto {

    @IsOptional() @IsString() cncKey?: string;  // dacă nu se trimite atunci se calculează
    @IsOptional() @IsString() oid?: string;

    @IsOptional() @IsNumber() timestamp?: number;

    @IsOptional() @IsString() cncId?: string;
    @IsOptional() @IsInt() wcaNo?: number;
    @IsOptional() @IsString() cncName?: string;

    @IsOptional() @IsString() activeAxes?: string;
    @IsOptional() @IsNumber() activeAxesTs?: number;

    @IsOptional() @IsString() blockText?: string;
    @IsOptional() @IsNumber() blockTs?: number;

    @IsOptional() @IsString() execution?: string;
    @IsOptional() @IsNumber() executionTs?: number;

    @IsOptional() @IsInt() lineNo?: number;
    @IsOptional() @IsNumber() lineTs?: number;

    @IsOptional() @IsString() controllerMode?: string;
    @IsOptional() @IsNumber() controllerModeTs?: number;

    @IsOptional() @IsInt() partCount?: number;
    @IsOptional() @IsNumber() partCountTs?: number;

    @IsOptional() @IsString() program?: string;
    @IsOptional() @IsNumber() programTs?: number;

    @IsOptional() @IsString() programComment?: string;
    @IsOptional() @IsNumber() programCommentTs?: number;

    @IsOptional() @IsString() toolId?: string;
    @IsOptional() @IsNumber() toolIdTs?: number;

    @IsOptional() @IsInt() feedRate?: number;
    @IsOptional() @IsNumber() feedRateTs?: number;

    @IsOptional() @IsInt() spindleSpeed?: number;
    @IsOptional() @IsNumber() spindleSpeedTs?: number;
}
