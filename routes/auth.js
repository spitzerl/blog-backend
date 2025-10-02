import express from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  successResponse, 
  errorResponse,
  sanitizeUser,
  handleAsync 
} from '../utils/helpers.js';
import { 
  userRegisterSchema, 
  userLoginSchema, 
  validateBody 
} from '../validation/schemas.js';
import { authRateLimitMiddleware } from '../middleware/security.js';

const router = express.Router();
const prisma = new PrismaClient();

// Inscription
router.post('/register', 
  authRateLimitMiddleware,
  validateBody(userRegisterSchema),
  handleAsync(async (req, res) => {
    const { email, password, roleId = 2 } = req.validatedData; // 2 = user par défaut

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'Un utilisateur avec cet email existe déjà', 409);
    }

    // Vérifier si le rôle existe
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return errorResponse(res, 'Rôle invalide', 400);
    }

    // Créer l'utilisateur
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId
      },
      include: {
        role: true
      }
    });

    // Générer le token
    const token = generateToken(user.id, user.email);

    // Retourner la réponse sans le mot de passe
    const userResponse = sanitizeUser(user);

    return successResponse(res, {
      user: userResponse,
      token
    }, 'Utilisateur créé avec succès', 201);
  })
);

// Connexion
router.post('/login',
  authRateLimitMiddleware,
  validateBody(userLoginSchema),
  handleAsync(async (req, res) => {
    const { email, password } = req.validatedData;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true
      }
    });

    if (!user) {
      return errorResponse(res, 'Email ou mot de passe incorrect', 401);
    }

    // Vérifier le mot de passe
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return errorResponse(res, 'Email ou mot de passe incorrect', 401);
    }

    // Générer le token
    const token = generateToken(user.id, user.email);

    // Retourner la réponse sans le mot de passe
    const userResponse = sanitizeUser(user);

    return successResponse(res, {
      user: userResponse,
      token
    }, 'Connexion réussie');
  })
);

// Obtenir le profil de l'utilisateur connecté
router.get('/profile',
  handleAsync(async (req, res) => {
    // Extraire le token manuellement
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Token d\'accès requis', 401);
    }

    try {
      const jwt = await import('jsonwebtoken');
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true }
      });

      if (!user) {
        return errorResponse(res, 'Utilisateur non trouvé', 401);
      }

      const userResponse = sanitizeUser(user);
      return successResponse(res, { user: userResponse });
    } catch {
      return errorResponse(res, 'Token invalide', 403);
    }
  })
);

export default router;