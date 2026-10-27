import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { dataSourceOptions } from './db.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [TypeOrmModule.forRootAsync({ useFactory: dataSourceOptions })],
  controllers: [HealthController, CoursesController],
  providers: [CoursesService],
})
export class AppModule {}
