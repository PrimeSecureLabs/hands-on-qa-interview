import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import userRoutes from './routes/userRoutes';
import customerRoutes from './routes/customerRoutes';
import teamsRoute from './routes/teamRoutes';
import { initUserSession } from './models/user/UserSession';
import { initRole } from './models/user/Role';
import { initUserRole } from './models/user/UserRole';
import { initTeam } from './models/team/Team';
import { initTeamMember } from './models/team/TeamMember';
import { initMember } from './models/team/Member';
import { initTeamInvitation } from './models/team/TeamInvitation';
import { initUserAuthentication } from './models/user/UserAuthentication';

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// CORREÇÃO BUG 1: ÍNICIO
// INICIALIZAÇÃO DOS MODELS
// ========================================
initUserSession(sequelize);
initRole(sequelize);
initUserRole(sequelize);
initTeam(sequelize);
initTeamMember(sequelize);
initMember(sequelize);
initTeamInvitation(sequelize);
initUserAuthentication(sequelize);

// ========================================
// MIDDLEWARE PARA ROTEAMENTO ALB/ECS FARGATE
// ========================================
// Este middleware remove prefixos de serviço do path para permitir
// roteamento através do ALB (Application Load Balancer)
//
// Exemplos:
// /central/health -> /health
// /central/api/users -> /api/users
// /central/users -> /users
function stripServicePrefix(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const servicePrefix = '/central';

  if (req.path.startsWith(servicePrefix)) {
    // Remove o prefixo apenas do URL
    req.url = req.url.substring(servicePrefix.length);

    // Se o URL ficar vazio após remover o prefixo, definir como /
    if (!req.url || req.url === '') {
      req.url = '/';
    }

    console.log(`[ALB ROUTING] ${req.originalUrl} -> ${req.url}`);
  }

  next();
}

// IMPORTANTE: Aplicar o middleware ANTES de definir qualquer rota
app.use(stripServicePrefix);


// ========================================
// CORREÇÃO BUG 3
// CONFIGURAÇÃO DE CORS
// ========================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origem (mobile apps, curl, postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS deste site não permite acesso a partir da origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(
  express.json({
    limit: '50mb',
  })
);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.0.1',
      database_host: process.env.DB_HOST,
      secret_key_length: process.env.SECRET_KEY?.length,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      details: error.message,
    });
  }
});

app.use('/users', userRoutes);
app.use('/customers', customerRoutes);
app.use('/teams', teamsRoute);

// ========================================
// CORREÇÃO BUG 1: FIM
// CONEXÃO E SINCRONIZAÇÃO DO BANCO
// ========================================
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected');
    // Models já foram inicializados, agora apenas sync
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });