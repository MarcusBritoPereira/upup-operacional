import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

jest.setTimeout(30_000);

describe('Application (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports liveness', () => {
    return request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ status: 'ok', check: 'live' });
      });
  });

  it('reports database readiness', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ status: 'ok', check: 'ready' });
      });
  });

  it('authenticates with an HttpOnly cookie and restores the session', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({ email: 'admin@upup.com', password: 'admin123' })
      .expect(200);

    const cookies = login.headers['set-cookie'] as string[] | undefined;
    if (!cookies) {
      throw new Error('Login did not return a session cookie');
    }
    expect(cookies.join(';')).toContain('HttpOnly');

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200)
      .expect(({ body }) => {
        expect((body as { user: any }).user).toMatchObject({
          email: 'admin@upup.com',
          role: 'admin',
          isActive: true,
        });
      });
  });

  it('rejects invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({ email: 'admin@upup.com', password: 'incorrect-password' })
      .expect(401);
  });

  it('rejects unauthenticated session access', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
