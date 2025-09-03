import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserSession, initUserSession } from '../models/user/UserSession';
import { UserRole } from '../models/user/UserRole';
import { Role } from '../models/user/Role';
import sequelize from '../config/database';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined in environment variables');
}

// Inicializa o model UserSession se necessário
if (!sequelize.isDefined('UserSession')) {
  initUserSession(sequelize);
}

export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      email: string;
    };
    // Verifica se o token está ativo na tabela user_sessions
    const session = await UserSession.findOne({
      where: {
        user_id: decoded.id,
        token,
        is_active: true,
      },
    });

    if (!session) {
      res.status(401).json({ error: 'Sessão expirada ou token inválido' });
      return;
    }

    (req as any).user = { id: decoded.id, email: decoded.email };
    next();
    return;
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }
};

export const requireAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  const userRoles = await UserRole.findAll({ where: { user_id: userId } });
  for (const userRole of userRoles) {
    const role = await Role.findByPk(userRole.role_id);
    if (role && role.name === 'Admin') {
      next();
      return;
    }
  }
  res.status(403).json({ error: 'Acesso negado: apenas administradores' });
  return;
};
