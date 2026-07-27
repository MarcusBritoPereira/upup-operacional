import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  sessionId?: string;
}

export interface RequestWithAuth extends Request {
  user: AuthUser;
}
