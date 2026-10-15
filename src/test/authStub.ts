import type { AuthResult, LoginCredentials } from '@/domain/auth';

/** Caso de uso falso controlable desde las pruebas. */
export function createAuthStub(
  result: AuthResult = { kind: 'success', displayName: 'Steven Luna' },
) {
  let resolvePending: (() => void) | null = null;
  let deferred = false;
  const fn = vi.fn<(credentials: LoginCredentials) => Promise<AuthResult>>(
    () =>
      new Promise<AuthResult>((resolve) => {
        if (deferred) {
          resolvePending = () => resolve(result);
        } else {
          resolve(result);
        }
      }),
  );
  return {
    authenticate: fn,
    /** Las siguientes llamadas quedan pendientes hasta llamar a release(). */
    defer() {
      deferred = true;
    },
    release() {
      resolvePending?.();
    },
  };
}
