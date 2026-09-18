import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationConfigEntity } from './entity';
import { ApplicationConfigService } from './service';
import { ApplicationConfigController } from './controller';

@Module({
    imports: [TypeOrmModule.forFeature([ApplicationConfigEntity])],
    controllers: [ApplicationConfigController],
    providers: [ApplicationConfigService],
    exports: [ApplicationConfigService],
})
export class ApplicationConfigModule {}
