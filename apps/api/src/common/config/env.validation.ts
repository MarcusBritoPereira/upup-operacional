export type CookieSameSite = 'lax' | 'strict' | 'none';
export type NodeEnvironment = 'development' | 'production' | 'test';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  PORT: number;
  NODE_ENV: NodeEnvironment;
  CORS_ORIGINS: string;
  COOKIE_SAME_SITE: CookieSameSite;
  COOKIE_SECURE: boolean;
  COOKIE_DOMAIN?: string;
  CREDENTIALS_ENCRYPTION_KEY?: string;
  REQUIRE_TRUSTED_ORIGIN: boolean;
}

function requireString(
  config: Record<string, unknown>,
  key: string,
  fallback?: string,
): string {
  const value = config[key] ?? fallback;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

function parseBoolean(value: unknown, key: string, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new Error(`${key} must be true or false`);
}

export function validateEnv(config: Record<string, unknown>): Env {
  try {
    const databaseUrl = requireString(config, 'DATABASE_URL');
    if (!URL.canParse(databaseUrl)) {
      throw new Error('DATABASE_URL must be a valid URL');
    }

    const jwtSecret = requireString(config, 'JWT_SECRET');
    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    const jwtExpiresIn = requireString(config, 'JWT_EXPIRES_IN', '1h');
    if (!/^\d+[mhd]$/.test(jwtExpiresIn)) {
      throw new Error('JWT_EXPIRES_IN must use m, h, or d');
    }

    const nodeEnv = requireString(
      config,
      'NODE_ENV',
      'development',
    ) as NodeEnvironment;
    if (!['development', 'production', 'test'].includes(nodeEnv)) {
      throw new Error('NODE_ENV must be development, production, or test');
    }

    const port = Number(config.PORT ?? 3001);
    if (!Number.isInteger(port) || port <= 0) {
      throw new Error('PORT must be a positive integer');
    }

    const corsOrigins = requireString(
      config,
      'CORS_ORIGINS',
      'http://localhost:3000,http://localhost:3001',
    );
    const origins = corsOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    if (origins.length === 0) {
      throw new Error('CORS_ORIGINS must include at least one origin');
    }
    if (
      nodeEnv === 'production' &&
      origins.some((origin) => !origin.startsWith('https://'))
    ) {
      throw new Error('All production CORS origins must use HTTPS');
    }

    const cookieSameSite = requireString(
      config,
      'COOKIE_SAME_SITE',
      'lax',
    ) as CookieSameSite;
    if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
      throw new Error('COOKIE_SAME_SITE must be lax, strict, or none');
    }

    const cookieSecure = parseBoolean(
      config.COOKIE_SECURE,
      'COOKIE_SECURE',
      false,
    );
    if (nodeEnv === 'production' && !cookieSecure) {
      throw new Error('COOKIE_SECURE must be true in production');
    }
    if (cookieSameSite === 'none' && !cookieSecure) {
      throw new Error('COOKIE_SECURE must be true when COOKIE_SAME_SITE is none');
    }

    const cookieDomain =
      typeof config.COOKIE_DOMAIN === 'string' && config.COOKIE_DOMAIN.trim()
        ? config.COOKIE_DOMAIN.trim()
        : undefined;

    const credentialsEncryptionKey =
      typeof config.CREDENTIALS_ENCRYPTION_KEY === 'string' &&
      config.CREDENTIALS_ENCRYPTION_KEY.trim()
        ? config.CREDENTIALS_ENCRYPTION_KEY.trim()
        : undefined;

    if (
      nodeEnv === 'production' &&
      (!credentialsEncryptionKey || credentialsEncryptionKey.length < 32)
    ) {
      throw new Error(
        'CREDENTIALS_ENCRYPTION_KEY must be at least 32 characters long in production',
      );
    }

    const requireTrustedOrigin = parseBoolean(
      config.REQUIRE_TRUSTED_ORIGIN,
      'REQUIRE_TRUSTED_ORIGIN',
      nodeEnv === 'production',
    );

    return {
      DATABASE_URL: databaseUrl,
      JWT_SECRET: jwtSecret,
      JWT_EXPIRES_IN: jwtExpiresIn,
      PORT: port,
      NODE_ENV: nodeEnv,
      CORS_ORIGINS: corsOrigins,
      COOKIE_SAME_SITE: cookieSameSite,
      COOKIE_SECURE: cookieSecure,
      REQUIRE_TRUSTED_ORIGIN: requireTrustedOrigin,
      ...(cookieDomain ? { COOKIE_DOMAIN: cookieDomain } : {}),
      ...(credentialsEncryptionKey
        ? { CREDENTIALS_ENCRYPTION_KEY: credentialsEncryptionKey }
        : {}),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown validation error';
    console.error(`❌ Invalid environment configuration: ${message}`);
    throw new Error('Invalid environment configuration');
  }
}
