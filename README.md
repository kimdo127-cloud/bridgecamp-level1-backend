# 브릿지캠프 교육 과정 안내 · 백엔드 (Level 1)

가상 IT·AI 교육 회사 **브릿지캠프**의 교육 과정·기수 데이터를 관리하는 API 서버입니다.

> AX Campus 1기 · 빌더트랙 1차 과제 Level 1. 모든 정보는 가상 데이터입니다.

> ⏳ **무료 서버라 첫 접속이 느릴 수 있어요.** Render 무료 서버는 15분 동안 요청이 없으면 잠들고, 다음 첫 요청에 깨어나는 데 1분 가까이 걸립니다. 고장이 아닙니다.

- 기획서: [기획서.md](./기획서.md)
- 프론트엔드 저장소: [bridgecamp-level1-frontend](https://github.com/kimdo127-cloud/bridgecamp-level1-frontend)

## API

| 기능 | 주소 | 설명 |
| --- | --- | --- |
| 연결 상태 확인 | `GET /health` | 서버와 DB 연결 상태. 예: `{"status":"ok","db":"connected"}` |
| 과정 목록 | `GET /courses` | 모든 과정과 각 과정의 기수 |
| 과정 상세 | `GET /courses/:id` | 과정 하나와 기수. 없으면 404 "찾는 과정이 없어요." |
| 과정 등록 | `POST /courses` | 과정과 첫 기수들을 한 번에 저장 |
| 기수 추가 | `POST /courses/:id/cohorts` | 기수 번호는 마지막 기수 + 1로 자동 부여 |

잘못된 입력은 저장하지 않고 칸별 안내를 돌려줍니다 (400).

```json
{ "message": "입력한 내용을 다시 확인해 주세요.", "errors": { "price": "수강료는 숫자로만 입력해 주세요. (예: 190000)" } }
```

## 데이터 구조

```
courses (과정) 1 ──< N cohorts (기수)
```

- `courses`: 이름, 분야, 난이도, 수업 방식, 소개, 수강료, 기본 정원, 강사, 추천 대상, 커리큘럼, 준비 사항
- `cohorts`: 과정 번호, 기수 번호, 개강일, 종강일, 정원, 수업 시간
- 테이블은 DB 안의 `level1` 스키마에 만들어집니다.

## 설정값

| 이름 | 뜻 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 주소. 로컬은 Render DB의 **External** 주소, Render 서버는 **Internal** 주소 |
| `DB_SCHEMA` | 이 과제가 쓰는 DB 안의 공간 이름 (`level1`) |
| `FRONTEND_ORIGIN` | 요청을 허락할 프론트엔드 주소. 여러 개면 쉼표로 구분 |
| `PORT` | 서버 포트. Render는 자동으로 정해 줌 (로컬 기본 4100) |

`.env`는 GitHub에 올리지 않습니다. `.env.example`을 복사해서 쓰세요.

## 로컬에서 실행

```bash
npm install
cp .env.example .env   # DATABASE_URL 채우기
npm run seed           # 가상 데이터 넣기 (과정 6개, 기수 10개)
npm run build && npm run start:prod   # http://localhost:4100/health
```

## 배포 (Render)
- New → Web Service → 이 저장소
- Region: DB와 같은 곳 (Virginia)
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`
- Environment: `DATABASE_URL`(Internal 주소), `DB_SCHEMA=level1`, `FRONTEND_ORIGIN`(Vercel 주소)
