import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ensureSchema } from './db.js';

async function bootstrap() {
  await ensureSchema();
  const app = await NestFactory.create(AppModule);

  // 프론트엔드 주소에서 오는 요청만 받는다. 여러 개면 쉼표로 구분 (예: http://localhost:3100,https://xxx.vercel.app)
  const origins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3100')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins });

  await app.listen(process.env.PORT ?? 4100);
}
await bootstrap();
