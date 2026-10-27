import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cohort, Course } from './entities.js';
import { validateCohort, validateCourse, validateThumbnail, type FieldErrors } from './validation.js';

function rejectIfInvalid(errors: FieldErrors) {
  if (Object.keys(errors).length > 0) {
    throw new BadRequestException({ message: '입력한 내용을 다시 확인해 주세요.', errors });
  }
}

function toResponse(course: Course) {
  const { cohorts, ...rest } = course;
  return {
    ...rest,
    cohorts: [...(cohorts ?? [])]
      .sort((a, b) => a.cohortNo - b.cohortNo)
      .map(({ course: _course, ...c }) => c),
  };
}

@Injectable()
export class CoursesService {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async list() {
    const courses = await this.db.getRepository(Course).find({ relations: { cohorts: true }, order: { id: 'ASC' } });
    return courses.map(toResponse);
  }

  async get(id: number) {
    const course = await this.db.getRepository(Course).findOne({ where: { id }, relations: { cohorts: true } });
    if (!course) throw new NotFoundException({ message: '찾는 과정이 없어요.' });
    return toResponse(course);
  }

  async create(body: unknown) {
    const { errors, value } = validateCourse(body);
    rejectIfInvalid(errors);

    const { cohorts, ...courseValues } = value;
    // 과정과 첫 기수들은 함께 저장되거나 함께 실패한다
    const id = await this.db.transaction(async (tx) => {
      const course = await tx.getRepository(Course).save(tx.getRepository(Course).create(courseValues));
      await tx.getRepository(Cohort).save(cohorts.map((c, i) => tx.getRepository(Cohort).create({ ...c, courseId: course.id, cohortNo: i + 1 })));
      return course.id;
    });
    return this.get(id);
  }

  // 대표 사진 바꾸기. null을 보내면 사진을 빼고 분야 그림으로 돌아간다
  async updateThumbnail(id: number, body: unknown) {
    await this.get(id);
    const { error, value } = validateThumbnail((body as { thumbnail?: unknown } | null)?.thumbnail);
    rejectIfInvalid(error ? { thumbnail: error } : {});
    await this.db.getRepository(Course).update(id, { thumbnail: value });
    return this.get(id);
  }

  // 기수 번호는 그 과정의 마지막 기수 + 1로 자동으로 붙는다
  async addCohort(courseId: number, body: unknown) {
    await this.get(courseId);
    const { errors, value } = validateCohort(body);
    rejectIfInvalid(errors);

    const repo = this.db.getRepository(Cohort);
    const last = await repo.maximum('cohortNo', { courseId });
    const cohort = await repo.save(repo.create({ ...value, courseId, cohortNo: (last ?? 0) + 1 }));
    const { course: _course, ...rest } = cohort;
    return rest;
  }
}
