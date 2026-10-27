import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cohort, Course } from './entities.js';
import { todayKST, validateCohort, validateCourse, type FieldErrors } from './validation.js';

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

  // 과정 정보 수정 (대표 사진 포함). 기수는 따로 수정한다
  async update(id: number, body: unknown) {
    await this.get(id);
    const { errors, value } = validateCourse(body, { withCohorts: false });
    rejectIfInvalid(errors);
    const { cohorts: _cohorts, ...courseValues } = value;
    await this.db.getRepository(Course).update(id, courseValues);
    return this.get(id);
  }

  // 기수 수정. 이미 시작했거나 끝난 기수는 수강생이 있을 수 있어 고치지 않는다
  async updateCohort(courseId: number, cohortId: number, body: unknown) {
    const repo = this.db.getRepository(Cohort);
    const cohort = await repo.findOneBy({ id: cohortId, courseId });
    if (!cohort) throw new NotFoundException({ message: '찾는 기수가 없어요.' });
    if (cohort.startDate <= todayKST()) {
      throw new BadRequestException({ message: '이미 시작한 기수는 수정할 수 없어요.', errors: {} });
    }
    const { errors, value } = validateCohort(body);
    rejectIfInvalid(errors);
    await repo.update(cohortId, value);
    const { course: _course, ...rest } = (await repo.findOneByOrFail({ id: cohortId }));
    return rest;
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
