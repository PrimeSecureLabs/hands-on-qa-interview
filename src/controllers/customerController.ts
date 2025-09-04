import { Request, Response } from 'express';
import { Customer } from '../models/customer/Customer';
import { paymentGatewayService } from '../services/paymentGatewayService';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

function isNumeric(str: string) {
  return /^\d+$/.test(str);
}

function validateCPF(cpf: string): boolean {
  if (typeof cpf !== 'string') {
    cpf = String(cpf ?? '');
  }
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
  if (rest !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

function validateBirthday(birthday: string): boolean {
  if (!birthday) return true;

  const date = new Date(birthday);
  if (isNaN(date.getTime())) return false;

  // Verifica se a data não é no futuro
  const today = new Date();
  if (date > today) return false;

  const minAge = 13;
  const minBirthday = new Date();
  minBirthday.setFullYear(today.getFullYear() - minAge);

  if (date > minBirthday) return false;

  const maxAge = 120;
  const maxBirthday = new Date();
  maxBirthday.setFullYear(today.getFullYear() - maxAge);

  if (date < maxBirthday) return false;

  return true;
}

export const validateCustomerData = async (
  customerData: any,
  isUpdate: boolean = false
): Promise<string[]> => {
  const errors: string[] = [];

  if (!isUpdate) {
    // Criação: obrigatórios
    if (!customerData.phone) {
      errors.push('O campo phone é obrigatório.');
    }
    if (!customerData.document || !validateCPF(customerData.document)) {
      errors.push(
        'O campo document (CPF) é obrigatório e deve ser um CPF válido.'
      );
    }
  } else {
    if (
      customerData.document !== undefined &&
      customerData.document !== '' &&
      !validateCPF(customerData.document)
    ) {
      errors.push('O campo document (CPF) deve ser um CPF válido.');
    }
  }

  if (customerData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      errors.push('Formato de email inválido.');
    } else {
      const existingCustomer = await Customer.findOne({
        where: { email: customerData.email },
      });
      if (
        existingCustomer &&
        (!isUpdate || existingCustomer.id !== customerData.id)
      ) {
        errors.push('Email já registrado no sistema.');
      }
    }
  }

  if (customerData.password) {
    if (customerData.password.length < 6) {
      errors.push('Senha deve ter no mínimo 6 caracteres.');
    }
  }

  if (customerData.birthday !== undefined && customerData.birthday !== '') {
    if (!validateBirthday(customerData.birthday)) {
      errors.push(
        'Data de nascimento inválida. Deve ser uma data válida, não no futuro, e a pessoa deve ter entre 13 e 120 anos.'
      );
    }
  }

  return errors;
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    // Extrai o affiliateLink do body (se existir)
    const { affiliateLink, ...customerData } = req.body;

    // Normaliza birthday para 'YYYY-MM-DD' se existir
    if (customerData.birthday) {
      const date = new Date(customerData.birthday);
      if (!isNaN(date.getTime())) {
        // Ajusta para o formato correto
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        customerData.birthday = `${yyyy}-${mm}-${dd}`;
      }
    }

    // Validação comentada - permite criação sem validar dados
    // CORREÇÃO BUG #5 - Restauração da validação de dados do cliente
    const validationErrors = await validateCustomerData(customerData);
     if (validationErrors.length > 0) {
       return res.status(400).json({ errors: validationErrors });
     }

    // Valida o link de afiliado se foi fornecido (validação inicial)
    let affiliateValidation = null;
    if (affiliateLink) {
      affiliateValidation = await paymentGatewayService.validateAffiliateLink(
        affiliateLink
      );
      if (!affiliateValidation.isValid) {
        return res.status(400).json({
          errors: ['Link de afiliado inválido ou não encontrado.'],
        });
      }
    }

    // Cria o customer no Stripe
    const stripeCustomer = await stripe.customers.create({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      metadata: {
        cpf: req.body.document,
        birthday: req.body.birthday || '',
      },
    });

    // Cria o customer no banco local
    const customer = await Customer.create({
      ...req.body,
      stripe_customer_id: stripeCustomer.id,
    });

    // Se tiver affiliateLink válido, registra no payment-gateway-svc
    let affiliateResult = null;
    if (
      affiliateLink &&
      affiliateValidation?.isValid &&
      affiliateValidation.userId
    ) {
      try {
        // Registra no payment-gateway
        affiliateResult =
          await paymentGatewayService.registerCustomerWithAffiliate({
            customerData: customer.toJSON(),
            affiliateLink,
          });

        // Se bem-sucedido, atualiza o customer local com o affiliate_user_id
        if (affiliateResult && !affiliateResult.error) {
          await customer.update({
            affiliate_user_id: affiliateValidation.userId,
          });
        }
      } catch (error: any) {
        console.error(
          'Erro ao registrar afiliado, mas customer foi criado:',
          error.message
        );
        // Não quebra o fluxo, apenas loga o erro
      }
    }

    res.status(201).json({
      customer,
      affiliate: affiliateResult || null,
      message: affiliateLink
        ? affiliateResult?.warning ||
          'Customer criado e vinculado ao afiliado com sucesso'
        : 'Customer criado com sucesso',
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(400).json({ error: error.message });
  }
};

export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isPasswordValid = await customer.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = require('jsonwebtoken').sign(
      { id: customer.id, email: customer.email },
      SECRET_KEY,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customerIdFromToken = (req as any).user?.id;
    const customerIdFromParams = parseInt(req.params.id);

    if (customerIdFromToken !== customerIdFromParams) {
      return res.status(403).json({
        error: 'Você não tem permissão para atualizar outro cliente.',
      });
    }

    const customer = await Customer.findByPk(customerIdFromParams);
    if (customer) {
      const validationErrors = await validateCustomerData(
        { ...req.body, id: customer.id },
        true
      );
      if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }

      await customer.update(req.body);
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Cliente não encontrado.' });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customerIdFromToken = (req as any).user?.id;
    const customerIdFromParams = parseInt(req.params.id);

    if (customerIdFromToken !== customerIdFromParams) {
      return res
        .status(403)
        .json({ error: 'Você não tem permissão para deletar outro cliente.' });
    }

    const customer = await Customer.findByPk(customerIdFromParams);
    if (customer) {
      await customer.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Cliente não encontrado.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ error: 'Cliente não encontrado.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const validateAffiliateLink = async (req: Request, res: Response) => {
  try {
    const { link } = req.params;

    if (!link) {
      return res.status(400).json({ error: 'Link de afiliado é obrigatório.' });
    }

    const validation = await paymentGatewayService.validateAffiliateLink(link);

    res.json(validation);
  } catch (error: any) {
    console.error('Erro ao validar link de afiliado:', error);
    res.status(500).json({
      error: 'Erro interno ao validar link de afiliado.',
      details: error.message,
    });
  }
};

export const getCorretorInfoForCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Token não fornecido' });

    const token = auth.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const customerIdParam = parseInt(req.params.id, 10);
    if (decoded.id !== customerIdParam) {
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
        JOIN users u ON u.id = c.affiliate_user_id
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
