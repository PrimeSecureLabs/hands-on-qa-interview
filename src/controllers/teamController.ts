import { Request, Response } from 'express';
import { Team } from '../models/team/Team';
import { TeamMember } from '../models/team/TeamMember';
import { Member } from '../models/team/Member';
import { TeamInvitation } from '../models/team/TeamInvitation';
import { Role } from '../models/user/Role';
import { UserRole } from '../models/user/UserRole';
import { Op } from 'sequelize';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

// Utilitário para gerar token de convite
const generateInviteToken = () => crypto.randomBytes(8).toString('hex');

// Criar um novo time (apenas admin)
export const createTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = await UserRole.findOne({ where: { user_id: userId } });
    const role = await Role.findByPk(userRole?.role_id);
    if (!role || role.name !== 'Admin') {
      return res.status(403).json({ error: 'Apenas administradores podem criar times.' });
    }
    // Verifica se já existe um time para esse owner
    const existingTeam = await Team.findOne({ where: { owner_user_id: userId } });
    if (existingTeam) {
      return res.status(400).json({ error: 'Usuário já é owner de um time.' });
    }
    const { name, description } = req.body;
    const team = await Team.create({
      owner_user_id: userId,
      name,
      description,
      created_at: new Date()
    });

    // Garante que existe um Member correspondente ao usuário
    let member = await Member.findOne({ where: { email: (req as any).user?.email } });
    if (!member) {
      // Busque o User para pegar os dados
      const { User } = require('../models/user/User');
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({ error: 'Usuário não encontrado para criar membro.' });
      }
      member = await Member.create({
        email: user.email,
        password: user.password,
        name: user.name,
        active: true,
        created_at: new Date()
      });
    }

    await TeamMember.create({
      team_id: team.id,
      member_id: member.id, // Use o id da tabela members!
      role_id: role.id,
      joined_at: new Date()
    });
    res.status(201).json(team);
  } catch (err) {
    console.error('Erro ao criar time:', err);
    res.status(500).json({ error: 'Erro ao criar time', details: err });
  }
};

// Listar roles permitidas para convite (exceto Admin)
export const getAllowedRoles = async (req: Request, res: Response) => {
  const roles = await Role.findAll({ where: { name: { [Op.ne]: 'Admin' } } });
  res.json(roles);
};

// Convidar membro para o time
export const inviteMember = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const userEmail = (req as any).user?.email;
  const { team_id, email, role_id } = req.body;

  // Busque o member_id do usuário autenticado
  const userMember = await Member.findOne({ where: { email: userEmail } });
  if (!userMember) {
    console.log('Não achou Member para o email:', userEmail);
    return res.status(403).json({ error: 'Usuário não é membro do time.' });
  }

  const teamMember = await TeamMember.findOne({ where: { team_id, member_id: userMember.id } });
  if (!teamMember) {
    return res.status(403).json({ error: 'Usuário não é membro do time.' });
  }

  const userRole = await Role.findByPk(teamMember.role_id);
  if (!userRole || userRole.name !== 'Admin') {
    return res.status(403).json({ error: 'Apenas administradores do time podem convidar.' });
  }

  const existingInvitation = await TeamInvitation.findOne({
    where: {
      team_id,
      email,
      status: 'pending'
    }
  });

  if (existingInvitation) {
    return res.status(400).json({ error: 'Este email já possui um convite pendente para este time.' });
  }

  const existingMember = await Member.findOne({ where: { email } });
  if (existingMember) {
    const existingTeamMember = await TeamMember.findOne({
      where: {
        team_id,
        member_id: existingMember.id
      }
    });
    if (existingTeamMember) {
      return res.status(400).json({ error: 'Este email já é membro do time.' });
    }
  }

  // Aqui, email é do futuro membro, está correto!
  const token = generateInviteToken();
  const invitation = await TeamInvitation.create({
    team_id,
    email,
    role_id,
    invited_by_user_id: userId,
    token,
    status: 'pending',
    created_at: new Date()
  });
  res.status(201).json({ invitation });
};

// Aceitar convite
export const acceptInvitation = async (req: Request, res: Response) => {
  const { token, name, password } = req.body;
  const invitation = await TeamInvitation.findOne({ where: { token } });
  if (!invitation) return res.status(404).json({ error: 'Convite não encontrado.' });
  if (invitation.status !== 'pending') return res.status(400).json({ error: 'Convite inválido.' });
  const now = new Date();
  const createdAt = new Date(invitation.created_at);
  if ((now.getTime() - createdAt.getTime()) > 24 * 60 * 60 * 1000) {
    invitation.status = 'expired';
    await invitation.save();
    return res.status(400).json({ error: 'Convite expirado.' });
  }

  // Hash da senha usando o mesmo padrão do sistema (sha256 + SECRET_KEY)
  const hash = crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');

  const member = await Member.create({
    email: invitation.email,
    password: hash,
    name,
    active: true,
    created_at: new Date()
  });
  await TeamMember.create({
    team_id: invitation.team_id,
    member_id: member.id,
    role_id: invitation.role_id,
    joined_at: new Date()
  });
  invitation.status = 'accepted';
  invitation.accepted_at = new Date();
  await invitation.save();
  res.status(201).json({ member });
};

// Remover membro do time (apenas admin)
export const removeTeamMember = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { team_id, member_id } = req.body;
  const teamMember = await TeamMember.findOne({ where: { team_id, member_id: userId } });
  const userRole = await Role.findByPk(teamMember?.role_id);
  if (!userRole || userRole.name !== 'Admin') {
    return res.status(403).json({ error: 'Apenas administradores do time podem remover membros.' });
  }
  await TeamMember.destroy({ where: { team_id, member_id } });
  res.status(204).send();
};

// Listar membros do time
export const listTeamMembers = async (req: Request, res: Response) => {
  const { team_id } = req.params;
  const members = await TeamMember.findAll({
    where: { team_id },
    include: [{ model: Member }, { model: Role }]
  });
  res.json(members);
};
