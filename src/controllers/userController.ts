import { Request, Response } from 'express';
import { User, initUser } from '../models/user/User';
import { UserLevel, initUserLevel } from '../models/user/UserLevel';
import { UserSession, initUserSession } from '../models/user/UserSession';
import { Role } from '../models/user/Role';
import { UserRole } from '../models/user/UserRole';
import { Wallet, initWallet } from '../models/wallet/Wallet';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined in environment variables');
}

// Inicialize os models apenas se ainda não estiverem inicializados
if (!sequelize.isDefined('User')) {
  initUser(sequelize);
}
if (!sequelize.isDefined('UserLevel')) {
  initUserLevel(sequelize);
}
if (!sequelize.isDefined('UserSession')) {
  initUserSession(sequelize);
}
if (!sequelize.isDefined('Wallet')) {
  initWallet(sequelize);
}

const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim())
    return 'Email não pode estar vazio ou conter apenas espaços';
  if (!emailRegex.test(email))
    return 'Formato de email inválido. Deve ser um endereço de email válido';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (password.length < 3) return 'Senha deve ter no minimo 3 caracteres';
  return null;
};

// Funções utilitárias para validação de CPF/CNPJ
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0,
    rest;
  for (let i = 1; i <= 9; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(cpf.substring(10, 11));
}

function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

function isValidDocument(document: string): boolean {
  return isValidCPF(document) || isValidCNPJ(document);
}

const validateUserData = async (
  userData: any,
  isUpdate: boolean = false
): Promise<string[]> => {
  const errors: string[] = [];

  if (userData.email) {
    const emailError = validateEmail(userData.email);
    if (emailError) {
      errors.push(emailError);
    } else {
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });
      if (existingUser && (!isUpdate || existingUser.id !== userData.id)) {
        errors.push('Email já registrado no sistema');
      }
    }
  }

  if (userData.password) {
    const passwordError = validatePassword(userData.password);
    if (passwordError) errors.push(passwordError);
  }

  if (userData.phone) {
    const phoneStr =
      typeof userData.phone === 'number'
        ? userData.phone.toString()
        : userData.phone;
    const existingPhone = await User.findOne({ where: { phone: phoneStr } });
    if (existingPhone && (!isUpdate || existingPhone.id !== userData.id)) {
      errors.push('Numero de telefone já registrado no sistema');
    }
  }

  // Validação e unicidade do documento (CPF/CNPJ)
  if (userData.document) {
    if (!isValidDocument(userData.document)) {
      errors.push('Documento inválido (CPF ou CNPJ)');
    } else {
      const existingDoc = await User.findOne({
        where: { document: userData.document },
      });
      if (existingDoc && (!isUpdate || existingDoc.id !== userData.id)) {
        errors.push('Documento já registrado no sistema');
      }
    }
  } else if (!isUpdate) {
    errors.push('Documento é obrigatório');
  }

  return errors;
};

// Função auxiliar para inserir na tabela users_authentication
async function createUserAuthentication(
  userId: number,
  token: string,
  status: string = 'pending'
) {
  await sequelize.query(
    `INSERT INTO users_authentication (user_id, token, status) VALUES (:user_id, :token, :status)`,
    {
      replacements: { user_id: userId, token, status },
      type: QueryTypes.INSERT,
    }
  );
}

// Função auxiliar para buscar autenticação do usuário
async function getUserAuthentication(userId: number) {
  const [result]: any = await sequelize.query(
    `SELECT * FROM users_authentication WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1`,
    {
      replacements: { user_id: userId },
      type: QueryTypes.SELECT,
    }
  );
  return result;
}

// Função auxiliar para atualizar status de autenticação
async function updateUserAuthenticationStatus(userId: number, status: string) {
  // Atualiza apenas se o status for diferente
  await sequelize.query(
    `UPDATE users_authentication
     SET status = :status, accepted_at = CURRENT_TIMESTAMP
     WHERE user_id = :user_id AND status != :status`,
    {
      replacements: { user_id: userId, status },
      type: QueryTypes.UPDATE,
    }
  );
}

// Cria link de afiliado no padrão "aff-<userId>-<timestamp>" se ainda não existir
async function createAffiliateLinkIfMissing(userId: number): Promise<string> {
  const [existing]: any = await sequelize.query(
    `SELECT generated_link FROM affiliate_links WHERE user_id = :user_id LIMIT 1`,
    { replacements: { user_id: userId }, type: QueryTypes.SELECT }
  );
  if (existing?.generated_link) {
    return existing.generated_link as string;
  }

  const generated_link = `aff-${userId}-${Date.now()}`;
  await sequelize.query(
    `INSERT INTO affiliate_links (user_id, generated_link, created_at)
     VALUES (:user_id, :generated_link, CURRENT_TIMESTAMP)`,
    {
      replacements: { user_id: userId, generated_link },
      type: QueryTypes.INSERT,
    }
  );
  return generated_link;
}

// Rota para obter informações do corretor vinculado a um customer
export const getCorretorInfoForCustomer = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Token não fornecido' });

    const token = auth.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const customerIdParam = parseInt(req.params.customerId, 10);
    if (decoded.customerId !== customerIdParam) {
      return res
        .status(403)
        .json({ error: 'Você não pode acessar outro customer' });
    }

    const rows = await sequelize.query(
      `
          SELECT
            u.id,
            u.name,
            u.email,
            u.phone,
            u.website,
            u.enterprise
          FROM customers c
          JOIN users u ON u.id = c.referred_by_user_id
          WHERE c.id = :customerId
          LIMIT 1
        `,
      {
        replacements: { customerId: customerIdParam },
        type: QueryTypes.SELECT,
      }
    );

    if (rows.length === 0)
      return res
        .status(404)
        .json({ error: 'Nenhum corretor vinculado a este customer' });

    const corretor = rows[0] as {
      id: number;
      name: string;
      email: string;
      phone: string;
      website: string;
      enterprise: string;
    };
    return res.json({
      customer_id: customerIdParam,
      corretor: {
        id: corretor.id,
        name: corretor.name,
        email: corretor.email,
        phone: corretor.phone,
        website: corretor.website,
        enterprise: corretor.enterprise,
      },
    });
  } catch (e) {
    console.error('getCorretorInfoForCustomer erro:', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
};

export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRoles = await UserRole.findAll({ where: { user_id: userId } });
    const roleIds = userRoles.map((r) => r.role_id);
    const roles = await Role.findAll({ where: { id: roleIds } });
    const isAdmin = roles.some((r) => r.id === 1); // Só permite admin (id 1)

    if (!isAdmin) return res.status(403).json({ error: 'Acesso negado' });

    const pendingUsers: any = await sequelize.query(
      `SELECT u.* FROM users u
       JOIN users_authentication ua ON u.id = ua.user_id
       WHERE ua.status = 'pending'`,
      { type: QueryTypes.SELECT }
    );

    res.json(pendingUsers);
  } catch (err) {
    console.error('getPendingUsers - erro:', err);
    res.status(500).json({
      error: 'Erro interno ao buscar usuários pendentes',
      details: err instanceof Error ? err.message : err,
    });
  }
};

// Rota para aprovar ou reprovar usuário (admin)
export const approveUser = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const userRoles = await UserRole.findAll({ where: { user_id: userId } });
  const roleIds = userRoles.map((r) => r.role_id);
  const roles = await Role.findAll({ where: { id: roleIds } });
  const isAdmin = roles.some((r) => r.id === 1); // Só permite admin (id 1)
  if (!isAdmin) return res.status(403).json({ error: 'Acesso negado' });

  const { id } = req.params;
  const { approve } = req.body; // true para aprovar, false para reprovar

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  // Atualiza status de autenticação
  await updateUserAuthenticationStatus(
    user.id,
    approve ? 'approved' : 'rejected'
  );

  // Só cria o vínculo em user_roles se for aprovado e ainda não existir
  if (approve) {
    const corretorRole = await Role.findOne({ where: { id: 2 } }); // ou { name: 'Corretor' } se preferir por nome
    if (corretorRole) {
      const existingUserRole = await UserRole.findOne({
        where: { user_id: user.id, role_id: corretorRole.id },
      });
      if (!existingUserRole) {
        await UserRole.create({
          user_id: user.id,
          role_id: corretorRole.id,
        });
      }
    }
    // Cria a wallet do usuário com saldo 0, se ainda não existir
    const existingWallet = await Wallet.findOne({
      where: { user_id: user.id },
    });
    if (!existingWallet) {
      await Wallet.create({ user_id: user.id, balance: 0 });
    }

    // Gera link de afiliado padrão se ainda não existir
    await createAffiliateLinkIfMissing(user.id);
  }

  res.json({
    message: `Usuário ${approve ? 'aprovado' : 'reprovado'} com sucesso`,
  });
};

export const createUser = async (req: Request, res: Response) => {
  const errors = await validateUserData(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const initialLevel = await UserLevel.findOne({
    order: [['level_number', 'ASC']],
  });
  if (!initialLevel) {
    return res
      .status(500)
      .json({ error: 'Níveis de usuário não configurados.' });
  }

  const {
    name,
    email,
    password,
    document,
    phone,
    localization,
    enterprise,
    company_position,
    website,
    birthday,
    bio,
  } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    document,
    phone,
    localization,
    enterprise,
    company_position,
    website,
    birthday,
    bio,
    points: 0,
    level: initialLevel.id,
  });

  // Cria registro de autenticação pendente (não utilizado ainda, mas criado para caso precise)
  const token = Math.random().toString(36).substring(2);
  await createUserAuthentication(user.id, token, 'pending');

  res.status(201).json(user);
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.validatePassword(password))) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Verifica se o usuário foi aprovado
  const auth = await getUserAuthentication(user.id);
  if (!auth || auth.status !== 'approved') {
    return res
      .status(403)
      .json({ error: 'Usuário ainda não aprovado pelo administrador' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);

  // Captura IP e user agent
  const ip_address =
    req.headers['x-forwarded-for']?.toString() ||
    req.socket.remoteAddress ||
    '';
  const user_agent = req.headers['user-agent'] || '';

  let session = await UserSession.findOne({
    where: {
      user_id: user.id,
      ip_address,
      user_agent,
      token,
      is_active: true,
    },
  });

  if (session) {
    session.ended_at = new Date();
    await session.save();
  } else {
    await UserSession.create({
      user_id: user.id,
      ip_address,
      user_agent,
      started_at: new Date(),
      is_active: true,
      token,
    });
  }

  res.json({ token });
};

export const getUsers = async (req: Request, res: Response) => {
  // Busca todos os usuários
  const users = await User.findAll();
  // Para cada usuário, busca as roles
  const usersWithRoles = await Promise.all(
    users.map(async (user: any) => {
      const userRoles = await UserRole.findAll({ where: { user_id: user.id } });
      const roleIds = userRoles.map((ur: any) => ur.role_id);
      const roles = await Role.findAll({ where: { id: roleIds } });
      return {
        ...user.toJSON(),
        roles: roles.map((r: any) => ({ id: r.id, name: r.name })),
      };
    })
  );
  res.json(usersWithRoles);
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  const results = await sequelize.query(query, { type: QueryTypes.SELECT });

  if (!results || results.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = results[0] as any;
  // Busca as roles do usuário
  const userRoles = await UserRole.findAll({ where: { user_id: user.id } });
  const roleIds = userRoles.map((ur: any) => ur.role_id);
  const roles = await Role.findAll({ where: { id: roleIds } });
  res.json({
    ...user,
    roles: roles.map((r: any) => ({ id: r.id, name: r.name })),
  });
};
export const updateUser = async (req: Request, res: Response) => {
  const userIdFromToken = (req as any).user?.id;
  const userIdFromParams = parseInt(req.params.id);

  if (userIdFromToken !== userIdFromParams) {
    return res
      .status(403)
      .json({ error: 'Você não tem permissão para atualizar outro usuário' });
  }

  const user = await User.findByPk(userIdFromParams);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const errors = await validateUserData({ ...req.body, id: user.id }, true);
  if (errors.length > 0) return res.status(400).json({ errors });

  let updateData = {
    ...req.body,
    localization: req.body.localization,
    enterprise: req.body.enterprise,
    company_position: req.body.company_position,
    website: req.body.website,
    birthday: req.body.birthday,
    bio: req.body.bio,
  };

  if (req.body.document !== undefined) updateData.document = req.body.document;

  if (updateData.points !== undefined) {
    const levels = await UserLevel.findAll({
      order: [['required_points', 'DESC']],
    });
    let newLevel = user.level;
    for (const level of levels) {
      if (updateData.points >= level.required_points) {
        newLevel = level.id;
        break;
      }
    }
    updateData.level = newLevel;
  }

  await user.update(updateData);
  // Busca as roles do usuário após update
  const userRoles = await UserRole.findAll({ where: { user_id: user.id } });
  const roleIds = userRoles.map((ur: any) => ur.role_id);
  const roles = await Role.findAll({ where: { id: roleIds } });
  res.json({
    ...user.toJSON(),
    roles: roles.map((r: any) => ({ id: r.id, name: r.name })),
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const userIdFromToken = (req as any).user?.id;
  const userIdFromParams = parseInt(req.params.id);

  if (userIdFromToken !== userIdFromParams) {
    return res
      .status(403)
      .json({ error: 'Você não tem permissão para deletar outro usuário' });
  }

  const user = await User.findByPk(userIdFromParams);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  await user.destroy();
  res.status(204).send();
};

export const logoutUser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.split(' ')[1];
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  // Busca a sessão ativa correspondente ao token e usuário
  const session = await UserSession.findOne({
    where: {
      user_id: userId,
      token,
      is_active: true,
    },
  });

  if (!session) {
    return res
      .status(404)
      .json({ error: 'Sessão não encontrada ou já deslogada' });
  }

  session.is_active = false;
  session.ended_at = new Date();
  await session.save();

  res.status(200).json({ message: 'Logout realizado com sucesso' });
};
