import type { AuthResult, LoginCredentials } from '@/domain/auth';

/** Puerto de autenticación (contracts/auth-gateway.md). */
export interface AuthGateway {
  authenticate(credentials: LoginCredentials): Promise<AuthResult>;
}
