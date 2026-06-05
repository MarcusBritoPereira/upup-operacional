import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string>('CORS_ORIGINS') || '';
  const allowedOrigins = corsOrigins.split(',').map((o) => o.trim()).filter((o) => o !== '');

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`🚀 UP Gestão Operacional API rodando na porta ${port}`);
}
bootstrap();
