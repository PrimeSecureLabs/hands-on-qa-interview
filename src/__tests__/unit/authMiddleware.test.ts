import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authMiddleware } from '../middlewares/authMiddleware';
import jwt from 'jsonwebtoken';

// Mocks
vi.mock('jsonwebtoken');
vi.mock('../models/user/UserSession');

/**
 * O objetivo dessa suíte é verificar se o middleware de autenticação:
 * - rejeita requisições sem cabeçalho de autorização;
 * - rejeita cabeçalhos malformados ou tokens expirados;
 * - aceita tokens válidos e injeta o usuário no request;
 * - não expõe mensagens internas e resiste a ataques de JWT bombing.
 */
describe('Auth Middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  // Antes de cada teste, inicializamos requisição e resposta genéricas
  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('Token Validation', () => {
    it('should reject requests without authorization header', async () => {
      // Não passando o header de autorização deve retornar 401
      await authMiddleware(req as any, res as any, next as any);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject malformed authorization headers', async () => {
      // Header "Bearer" sem token deve ser tratado como inválido
      req.headers.authorization = 'Bearer';
      // Simula verificação falhando ao decodificar o JWT
      const verifyMock = vi.mocked(jwt.verify);
      verifyMock.mockImplementation(() => {
        throw new Error('invalid token');
      });
      await authMiddleware(req as any, res as any, next as any);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept valid tokens', async () => {
      // Define um token válido no header
      req.headers.authorization = 'Bearer validtoken';
      // Mocka jwt.verify para retornar um payload decodificado
      const verifyMock = vi.mocked(jwt.verify);
      verifyMock.mockReturnValue({ id: 1, email: 'user@test.com' } as any);
      // Mocka UserSession para retornar uma sessão ativa
      const UserSessionModule: any = await import('../models/user/UserSession');
      UserSessionModule.UserSession.findOne = vi.fn().mockResolvedValue({
        id: 1,
        user_id: 1,
        is_active: true,
      });
      await authMiddleware(req as any, res as any, next as any);
      // Não deve setar status nem json, apenas chamar o next
      expect(res.status).not.toHaveBeenCalled();
      // O usuário deve ser preenchido no request para uso posterior
      expect(req.user).toEqual({ id: 1, email: 'user@test.com' });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should reject expired tokens', async () => {
      req.headers.authorization = 'Bearer expired';
      // Simula erro de expiração
      const verifyMock = vi.mocked(jwt.verify);
      verifyMock.mockImplementation(() => {
        throw new Error('jwt expired');
      });
      await authMiddleware(req as any, res as any, next as any);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Security Tests', () => {
    it('should not expose sensitive information in error messages', async () => {
      req.headers.authorization = 'Bearer invalid';
      // Força um erro interno contendo palavra "secret"
      const verifyMock = vi.mocked(jwt.verify);
      verifyMock.mockImplementation(() => {
        throw new Error('some internal secret error');
      });
      await authMiddleware(req as any, res as any, next as any);
      const jsonArg = res.json.mock.calls[0]?.[0];
      // A mensagem deve ser genérica e não conter termos sensíveis
      expect(jsonArg).toEqual({ error: 'Token inválido ou expirado' });
      expect(String(jsonArg).toLowerCase()).not.toContain('secret');
    });

    it('should handle JWT bombing attacks', async () => {
      // Simula um token extremamente longo (JWT bombing)
      const longToken = 'Bearer ' + 'a'.repeat(5000);
      req.headers.authorization = longToken;
      const verifyMock = vi.mocked(jwt.verify);
      verifyMock.mockImplementation(() => {
        throw new Error('invalid token');
      });
      await authMiddleware(req as any, res as any, next as any);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
