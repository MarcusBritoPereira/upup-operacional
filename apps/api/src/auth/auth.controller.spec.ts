/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

function createController(config: Record<string, unknown> = {}) {
  const authService = {
    login: jest.fn().mockResolvedValue({
      access_token: 'signed-token',
      user: { id: 'user-id', email: 'user@example.com' },
    }),
    getUserSession: jest.fn().mockResolvedValue({ id: 'user-id' }),
  };
  const configService = {
    get: jest.fn(
      (key: string) =>
        ({
          JWT_EXPIRES_IN: '1h',
          COOKIE_SECURE: false,
          COOKIE_SAME_SITE: 'lax',
          ...config,
        })[key],
    ),
  };

  return {
    controller: new AuthController(
      authService as unknown as AuthService,
      configService as unknown as ConfigService,
    ),
    authService,
  };
}

describe('AuthController', () => {
  it('sets an HttpOnly cookie with the JWT lifetime', async () => {
    const { controller } = createController();
    const response = { cookie: jest.fn() } as unknown as Response;

    await controller.login(
      { email: 'user@example.com', password: 'secret123' },
      response,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      'upup_token',
      'signed-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
      }),
    );
  });

  it('clears the cookie using the same security attributes', () => {
    const { controller } = createController({
      COOKIE_SECURE: true,
      COOKIE_SAME_SITE: 'none',
      COOKIE_DOMAIN: '.upup.com',
    });
    const response = { clearCookie: jest.fn() } as unknown as Response;

    controller.logout(response);

    expect(response.clearCookie).toHaveBeenCalledWith(
      'upup_token',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: '.upup.com',
      }),
    );
  });
});
