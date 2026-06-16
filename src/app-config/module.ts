import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationConfigEntity } from './entity';
import { ApplicationConfigService } from './service';

@Module({
    imports: [TypeOrmModule.forFeature([ApplicationConfigEntity])],
    providers: [ApplicationConfigService],
    exports: [ApplicationConfigService],
})
export class ApplicationConfigModule {}
