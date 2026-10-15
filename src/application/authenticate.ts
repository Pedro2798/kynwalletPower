import type { AuthResult, LoginCredentials } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';
import type { AuthGateway } from './ports/AuthGateway';

export type Authenticate = (credentials: LoginCredentials) => Promise<AuthResult>;

/** Caso de uso: inicia sesión delegando en el puerto de autenticación. */
export function createAuthenticate(gateway: AuthGateway): Authenticate {
  return async ({ email, password }) => {
    try {
      return await gateway.authenticate({ email: normalizeEmail(email), password });
    } catch {
      return { kind: 'unavailable' };
    }
  };
}
