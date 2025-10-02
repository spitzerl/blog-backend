import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

// Importation des routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';

// Importation des middlewares
import { 
  corsOptions, 
  rateLimitMiddleware,
  helmetOptions,
  errorHandler,
  notFoundHandler 
} from './middleware/security.js';

// Configuration
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middlewares de sécurité
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

// Health check (avant rate limiting pour éviter les restrictions)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use(rateLimitMiddleware);

// Middlewares de base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes avec authentification optionnelle pour la lecture
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Gestion des erreurs 404
app.use(notFoundHandler);

// Gestion des erreurs globales
app.use(errorHandler);

// Gestion de l'arrêt propre
process.on('SIGTERM', async () => {
  console.log('SIGTERM reçu, arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT reçu, arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend lancé sur http://localhost:${PORT}`);
  console.log(`📊 Health check disponible sur http://localhost:${PORT}/health`);
});
