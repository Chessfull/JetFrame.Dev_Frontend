// Authentication Request Models
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ExternalAuthCallbackRequest {
  provider: string;  // "Google" or "GitHub"
  code: string;
  state?: string;
  redirectUri?: string;
}

// Authentication Response Models
export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  avatarUrl?: string;
  authProvider: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  authProvider: string;
}

export type AuthProviderType = 'Email' | 'Google' | 'GitHub'; 