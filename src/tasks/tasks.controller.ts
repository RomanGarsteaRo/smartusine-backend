import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/******************************************************************************

 TEST RAPID  (curl / HTTP)
 .........................

# LIST cu filtre
curl "http://localhost:3000/tasks?status=10&clientName=SBI&limit=20"

# GET by id
curl http://localhost:3000/tasks/<id>



 # CREATE
 curl -X POST http://localhost:3000/tasks \
 -H "Content-Type: application/json" \
 -d '{"jobNo":"14195-1","status":10,"clientName":"SBI","statBlue":true}'

# PATCH (update parțial)
curl -X PATCH http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":20,"progress":50}'

# BULK upsert
curl -X POST http://localhost:3000/tasks/bulk \
-H "Content-Type: application/json" \
-d '[{"id":"5263...","jobNo":"14195-1","status":10}, {"id":"5264...","jobNo":"14195-2","status":5}]'



# DELETE
curl -X DELETE http://localhost:3000/tasks/<id>

*******************************************************************************/

@Controller('tasks')
export class TasksController {

    constructor(private readonly service: TasksService) {}

    @Get()
    findAll(@Query() q: QueryTaskDto) {
        return this.service.findAll(q);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    /* Creează task nou */
    @Post()
    create(@Body() dto: CreateTaskDto) {
        return this.service.create(dto);
    }

    /* Actualizează task existent */
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    /*
    endpoint opțional pentru import bulk/upsert
    Normal, pentru un singur task, folosești:
        POST /tasks → creează task nou
        PATCH /tasks/:id → actualizează task existent
        Dar dacă ai un set mare de date (ex: dintr-un JSON, dintr-un API extern, sau dintr-un seed actualizat periodic), atunci:
        nu e eficient să trimiți 1000 de request-uri POST/PATCH unul câte unul;
        ai nevoie de un endpoint care acceptă toată lista de task-uri odată și DB să decidă dacă inserează sau face update.

    POST /tasks/bulk este un endpoint opțional pentru situații unde vrei să imporți/actualizezi în bloc task-uri
    (seed, sincronizare din JSON, integrare cu alt sistem). Pentru lucru normal (UI → DB) te ajung POST/GET/PATCH/DELETE.

    Eficiență: un singur request → multe rânduri modificate.
    Sincronizare: poți sincroniza rapid DB cu o sursă externă (ex. tasks.json sau un API).
    Simplu: nu trebuie să verifici tu în cod dacă există → DB se ocupă (prin upsert).
    */
    @Post('bulk')
    bulkUpsert(@Body() rows: CreateTaskDto[]) {
        return this.service.upsertMany(rows);
    }
}
