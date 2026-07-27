import { createOriginValidationMiddleware } from './origin-validation.middleware';

describe('createOriginValidationMiddleware', () => {
  const middleware = createOriginValidationMiddleware(['https://app.upup.com']);

  function createResponse() {
    const response = {
      status: jest.fn(),
      json: jest.fn(),
    };
    response.status.mockReturnValue(response);
    return response;
  }

  it('rejects unsafe requests from untrusted origins', () => {
    const request = {
      method: 'POST',
      get: jest.fn((header: string) =>
        header === 'origin' ? 'https://attacker.example' : undefined,
      ),
    };
    const response = createResponse();
    const next = jest.fn();

    middleware(request as never, response as never, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows unsafe requests from configured origins', () => {
    const request = {
      method: 'PATCH',
      get: jest.fn((header: string) =>
        header === 'origin' ? 'https://app.upup.com' : undefined,
      ),
    };
    const response = createResponse();
    const next = jest.fn();

    middleware(request as never, response as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });

  it('allows safe requests without an Origin header', () => {
    const request = {
      method: 'GET',
      get: jest.fn().mockReturnValue(undefined),
    };
    const response = createResponse();
    const next = jest.fn();

    middleware(request as never, response as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects unsafe requests without origin when trusted origin is required', () => {
    const strictMiddleware = createOriginValidationMiddleware(
      ['https://app.upup.com'],
      true,
    );
    const request = {
      method: 'DELETE',
      get: jest.fn().mockReturnValue(undefined),
    };
    const response = createResponse();
    const next = jest.fn();

    strictMiddleware(request as never, response as never, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts trusted referer when origin is absent', () => {
    const strictMiddleware = createOriginValidationMiddleware(
      ['https://app.upup.com'],
      true,
    );
    const request = {
      method: 'POST',
      get: jest.fn((header: string) =>
        header === 'referer' ? 'https://app.upup.com/dashboard' : undefined,
      ),
    };
    const response = createResponse();
    const next = jest.fn();

    strictMiddleware(request as never, response as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
