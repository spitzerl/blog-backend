import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Utilitaires pour les mots de passe
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Utilitaires pour JWT
export const generateToken = (userId, email) => {
  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

export const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Utilitaires pour la pagination
export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

export const getPaginationOffset = (page, limit) => {
  return (page - 1) * limit;
};

// Utilitaires pour les erreurs
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Utilitaires pour les réponses API
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = 'Une erreur est survenue', statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

// Utilitaires pour la sécurité
export const sanitizeUser = (user) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

export const isValidId = (id) => {
  const parsed = parseInt(id);
  return !isNaN(parsed) && parsed > 0;
};