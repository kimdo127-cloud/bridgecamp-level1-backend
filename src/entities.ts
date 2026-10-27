import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn, type Relation } from 'typeorm';

// 두 엔티티가 서로를 참조하므로 ESM 순환 import를 피하려고 한 파일에 둔다.

// courses: 과정 (무엇을 배우는지)
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 40 })
  title: string;

  @Column({ length: 10 })
  category: string;

  @Column({ length: 10 })
  level: string;

  @Column({ length: 10 })
  format: string;

  @Column({ length: 60 })
  summary: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  price: number;

  @Column({ name: 'default_capacity', type: 'integer' })
  defaultCapacity: number;

  @Column({ name: 'instructor_name', length: 20 })
  instructorName: string;

  @Column({ name: 'instructor_bio', length: 60, default: '' })
  instructorBio: string;

  @Column({ name: 'recommended_for', type: 'text' })
  recommendedFor: string;

  @Column({ type: 'text' })
  curriculum: string;

  @Column({ type: 'text', default: '' })
  preparation: string;

  // 대표 사진. 화면에서 줄인 이미지를 data URL(base64)로 저장한다. 없으면 분야 그림을 보여 준다
  @Column({ type: 'text', nullable: true })
  thumbnail: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Cohort, (cohort) => cohort.course)
  cohorts: Relation<Cohort[]>;
}

// cohorts: 기수 (언제 여는지). courses 1 : N cohorts
@Entity('cohorts')
@Unique('uq_cohorts_course_no', ['courseId', 'cohortNo'])
export class Cohort {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'course_id', type: 'integer' })
  courseId: number;

  @ManyToOne(() => Course, (course) => course.cohorts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Relation<Course>;

  @Column({ name: 'cohort_no', type: 'integer' })
  cohortNo: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'integer' })
  capacity: number;

  @Column({ length: 40, default: '' })
  schedule: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
