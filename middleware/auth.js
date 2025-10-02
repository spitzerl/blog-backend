import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

export const requireRole = (roleName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (req.user.role.name !== roleName && req.user.role.name !== 'admin') {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    next();
  };
};

export const requireOwnershipOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Admin peut tout faire
    if (req.user.role.name === 'admin') {
      return next();
    }

    try {
      const resourceUserId = await getResourceUserId(req);
      
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre contenu' });
      }

      next();
    } catch {
      return res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
    }
  };
};