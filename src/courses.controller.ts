import { Body, Controller, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { CoursesService } from './courses.service.js';

function parseId(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) throw new NotFoundException({ message: '찾는 과정이 없어요.' });
  return n;
}

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  list() {
    return this.courses.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.courses.get(parseId(id));
  }

  @Post()
  create(@Body() body: unknown) {
    return this.courses.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.courses.update(parseId(id), body);
  }

  @Patch(':id/cohorts/:cohortId')
  updateCohort(@Param('id') id: string, @Param('cohortId') cohortId: string, @Body() body: unknown) {
    return this.courses.updateCohort(parseId(id), parseId(cohortId), body);
  }

  @Post(':id/cohorts')
  addCohort(@Param('id') id: string, @Body() body: unknown) {
    return this.courses.addCohort(parseId(id), body);
  }
}
