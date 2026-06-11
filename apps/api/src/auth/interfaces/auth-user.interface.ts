export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface RequestWithAuth {
  user: AuthUser;
}
