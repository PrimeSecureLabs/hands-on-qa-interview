import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined in environment variables');
}

export const customerAuthMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token malformado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: number; email: string };
    (req as any).user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }
};
