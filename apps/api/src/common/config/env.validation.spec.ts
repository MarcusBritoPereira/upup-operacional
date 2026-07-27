import { validateEnv } from './env.validation';

const baseEnv = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/database',
  JWT_SECRET: 'a-secure-secret-with-at-least-32-characters',
  JWT_EXPIRES_IN: '1h',
  PORT: '3001',
  NODE_ENV: 'test',
  CORS_ORIGINS: 'http://localhost:3000',
  COOKIE_SAME_SITE: 'lax',
  COOKIE_SECURE: 'false',
  REQUIRE_TRUSTED_ORIGIN: 'false',
};

describe('validateEnv', () => {
  it('parses a valid test configuration', () => {
    expect(validateEnv(baseEnv)).toMatchObject({
      PORT: 3001,
      COOKIE_SECURE: false,
      COOKIE_SAME_SITE: 'lax',
      REQUIRE_TRUSTED_ORIGIN: false,
    });
  });

  it('requires secure cookies for SameSite=None', () => {
    expect(() => validateEnv({ ...baseEnv, COOKIE_SAME_SITE: 'none' })).toThrow(
      'Invalid environment configuration',
    );
  });

  it('requires HTTPS origins and secure cookies in production', () => {
    expect(() => validateEnv({ ...baseEnv, NODE_ENV: 'production' })).toThrow(
      'Invalid environment configuration',
    );
  });

  it('requires an encryption key in production', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://app.upup.com',
        COOKIE_SECURE: 'true',
      }),
    ).toThrow('Invalid environment configuration');
  });

  it('parses production hardening values', () => {
    expect(
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://app.upup.com',
        COOKIE_SECURE: 'true',
        REQUIRE_TRUSTED_ORIGIN: 'true',
        CREDENTIALS_ENCRYPTION_KEY:
          'production-secret-with-at-least-32-characters',
      }),
    ).toMatchObject({
      COOKIE_SECURE: true,
      REQUIRE_TRUSTED_ORIGIN: true,
    });
  });
});
