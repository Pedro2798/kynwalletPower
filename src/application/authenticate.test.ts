import type { AuthGateway } from './ports/AuthGateway';
import { createAuthenticate } from './authenticate';

describe('createAuthenticate', () => {
  it('delega con el correo normalizado y la contraseña sin modificar', async () => {
    const gateway: AuthGateway = {
      authenticate: vi.fn().mockResolvedValue({ kind: 'success', displayName: 'Ana' }),
    };
    const result = await createAuthenticate(gateway)({
      email: ' Ana@Example.test ',
      password: ' con espacios ',
    });
    expect(gateway.authenticate).toHaveBeenCalledWith({
      email: 'ana@example.test',
      password: ' con espacios ',
    });
    expect(result).toEqual({ kind: 'success', displayName: 'Ana' });
  });

  it('FR-019: si el gateway lanza una excepción devuelve unavailable', async () => {
    const gateway: AuthGateway = { authenticate: vi.fn().mockRejectedValue(new Error('x')) };
    await expect(createAuthenticate(gateway)({ email: 'a@b.co', password: 'p' })).resolves.toEqual({
      kind: 'unavailable',
    });
  });
});
