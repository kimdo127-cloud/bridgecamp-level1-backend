import 'dotenv/config';
import { DataSource } from 'typeorm';
import { dataSourceOptions, DB_SCHEMA, ensureSchema } from './db.js';
import { Cohort, Course } from './entities.js';
import { SEED_COHORTS, SEED_COURSES } from './seed-data.js';

// 가상 데이터를 처음 상태로 다시 채운다: 기존 과정·기수를 모두 지우고 과정 6개, 기수 10개를 넣는다
async function seed() {
  await ensureSchema();
  const db = await new DataSource(dataSourceOptions()).initialize();
  await db.transaction(async (tx) => {
    await tx.query(`TRUNCATE "${DB_SCHEMA}"."cohorts", "${DB_SCHEMA}"."courses" RESTART IDENTITY CASCADE`);
    const idMap = new Map<number, number>();
    for (const { id, createdAt: _createdAt, ...c } of SEED_COURSES) {
      const saved = await tx.getRepository(Course).save(tx.getRepository(Course).create(c));
      idMap.set(id, saved.id);
    }
    for (const { id: _id, courseId, ...c } of SEED_COHORTS) {
      await tx.getRepository(Cohort).save(tx.getRepository(Cohort).create({ ...c, courseId: idMap.get(courseId)! }));
    }
  });
  console.log(`가상 데이터를 넣었어요: 과정 ${SEED_COURSES.length}개, 기수 ${SEED_COHORTS.length}개 (스키마 ${DB_SCHEMA})`);
  await db.destroy();
}
await seed();
