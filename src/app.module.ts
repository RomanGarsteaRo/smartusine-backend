/* app.module.ts */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TaskEntity } from './tasks/entities/task.entity';
import { SchedulingGateway } from './web-socket/sheduling.gateway';
import { RealtimeModule } from './web-socket/realtime.module';
import { CncsModule } from './cncs/cncs.module';
import { SchedulingModule } from './scheduling/scheduling.module';


@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env.${process.env.NODE_ENV}`, // ex: NODE_ENV=dev npm run start  (dev, prod, test)   |   npm i @nestjs/config
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'mariadb',
            host: process.env.DB_HOST,
            port: process?.env?.DB_PORT ? +process?.env?.DB_PORT : 3306,
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            synchronize: false, // [true] Doar pentru development si doar pentru crearea tabelului in DB daca nu exista!
        }),
        TypeOrmModule.forFeature([TaskEntity]),
        RealtimeModule,
        TasksModule,
        CncsModule,
        SchedulingModule,
    ],
    controllers: [AppController],
    providers: [AppService, SchedulingGateway],
})
export class AppModule {
}
