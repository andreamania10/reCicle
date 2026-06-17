export interface User {
  id: number;
  username?: string;
  email?: string;
  role: string;
  avatar_url?: string | null;
  location?: string;
  status?: string;
  avg_rating?: string;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  location?: string;
}

export interface RegisterResponse {
  affectedRows?: number;
  insertId?: number;
  message?: string;
}

export interface JwtPayload {
  userId: number;
  role: string;
}