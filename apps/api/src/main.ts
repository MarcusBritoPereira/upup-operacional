import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { createOriginValidationMiddleware } from './common/middleware/origin-validation.middleware';
import { createRequestContextMiddleware } from './common/middleware/request-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  const configService = app.get(ConfigService);
  const allowedOrigins = configService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(createRequestContextMiddleware());
  app.use(cookieParser());
  app.use(
    createOriginValidationMiddleware(
      allowedOrigins,
      configService.get<boolean>('REQUIRE_TRUSTED_ORIGIN') ?? false,
    ),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
  console.log(`🚀 UP Gestão Operacional API rodando na porta ${port}`);
}
void bootstrap();
