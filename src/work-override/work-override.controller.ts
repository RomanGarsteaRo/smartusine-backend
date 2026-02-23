import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { WorkDayOverrideService } from './work-override.service';
import { CreateUzineOverrideTypeDto, UpsertUzineOverrideBatchDto } from './dto/work-override.dto';




@Controller('work/overrides')
export class WorkDayOverrideController {
    constructor(private readonly svc: WorkDayOverrideService) {}




    /* ---------- TYPES ---------- */

    @Get('types')
    listTypes() {
        return this.svc.listTypes();
    }

    @Post('types')
    createType(@Body() dto: CreateUzineOverrideTypeDto) {
        return this.svc.createType(dto);
    }

    @Delete('types/:id')
    async deleteType(@Param('id', ParseIntPipe) id: number) {
        await this.svc.deleteTypeById(id);
        return { ok: true };
    }





    /* ---------- OVERRIDES ---------- */

    /**
     * Query:
     *  - fromAbsMs: number (obligatoriu)
     *  - toAbsMs: number (opțional, default from+180 zile)
     */
    @Get()
    listRange(
        @Query('fromAbsMs') fromAbsMs: string,
        @Query('toAbsMs') toAbsMs?: string,
    ) {
        const from = Number(fromAbsMs);
        const to = toAbsMs != null ? Number(toAbsMs) : undefined;
        return this.svc.listRange(from, to);
    }

    @Post()
    upsertBatch(@Body() dto: UpsertUzineOverrideBatchDto) {
        return this.svc.upsertBatch(dto);
    }

    @Delete(':id')
    async deleteById(@Param('id', ParseIntPipe) id: number) {
        await this.svc.deleteById(id);
        return { ok: true };
    }
}