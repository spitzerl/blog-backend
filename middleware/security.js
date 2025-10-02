import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Configuration CORS
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Configuration Rate Limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Nombre de requêtes
  duration: 60, // Par minute
});

const authRateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 5, // 5 tentatives
  duration: 60 * 15, // Par 15 minutes
});

export const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const remainingPoints = rejRes.remainingPoints;
    const msBeforeNext = rejRes.msBeforeNext;

    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': 100,
      'X-RateLimit-Remaining': remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext)
    });

    return res.status(429).json({
      error: 'Trop de requêtes, veuillez réessayer plus tard'
    });
  }
};

export const authRateLimitMiddleware = async (req, res, next) => {
  try {
    await authRateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const remainingPoints = rejRes.remainingPoints;
    const msBeforeNext = rejRes.msBeforeNext;

    res.set({
      'Retry-After': Math.round(msBeforeNext / 1000) || 1,
      'X-RateLimit-Limit': 5,
      'X-RateLimit-Remaining': remainingPoints,
      'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext)
    });

    return res.status(429).json({
      error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
    });
  }
};

// Configuration Helmet pour la sécurité
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Middleware d'erreur global
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erreur de validation Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Cette ressource existe déjà',
      details: 'Conflit de données unique'
    });
  }

  // Erreur de ressource non trouvée Prisma
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Ressource non trouvée'
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré'
    });
  }

  // Erreur personnalisée
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Erreur serveur par défaut
  return res.status(500).json({
    error: 'Erreur interne du serveur'
  });
};

// Middleware pour les routes non trouvées
export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
};