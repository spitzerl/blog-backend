import { z } from 'zod';

// Schémas de validation pour les posts
export const postCreateSchema = z.object({
  title: z.string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  content: z.string()
    .min(10, 'Le contenu doit faire au moins 10 caractères'),
  excerpt: z.string()
    .max(500, 'L\'extrait ne peut pas dépasser 500 caractères')
    .optional(),
  coverImage: z.string()
    .url('L\'URL de l\'image de couverture n\'est pas valide')
    .optional()
});

export const postUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères')
    .optional(),
  content: z.string()
    .min(10, 'Le contenu doit faire au moins 10 caractères')
    .optional(),
  excerpt: z.string()
    .max(500, 'L\'extrait ne peut pas dépasser 500 caractères')
    .optional(),
  coverImage: z.string()
    .url('L\'URL de l\'image de couverture n\'est pas valide')
    .optional()
});

// Schémas de validation pour les commentaires
export const commentCreateSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu du commentaire est requis')
    .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères'),
  postId: z.number()
    .int('L\'ID du post doit être un entier')
    .positive('L\'ID du post doit être positif')
});

export const commentUpdateSchema = z.object({
  content: z.string()
    .min(1, 'Le contenu du commentaire est requis')
    .max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères')
});

// Schémas de validation pour l'authentification
export const userRegisterSchema = z.object({
  email: z.string()
    .email('L\'adresse email n\'est pas valide'),
  password: z.string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  roleId: z.number()
    .int('L\'ID du rôle doit être un entier')
    .positive('L\'ID du rôle doit être positif')
    .optional()
});

export const userLoginSchema = z.object({
  email: z.string()
    .email('L\'adresse email n\'est pas valide'),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
});

// Schémas de validation pour la pagination et recherche
export const paginationSchema = z.object({
  page: z.preprocess(
    (val) => val ? parseInt(String(val)) : 1,
    z.number().int().min(1, 'Le numéro de page doit être positif').default(1)
  ),
  limit: z.preprocess(
    (val) => val ? parseInt(String(val)) : 10,
    z.number().int().min(1, 'La limite minimum est 1').max(100, 'La limite maximum est 100').default(10)
  )
});

export const searchSchema = z.object({
  query: z.string()
    .min(1, 'La recherche ne peut pas être vide')
    .max(100, 'La recherche ne peut pas dépasser 100 caractères')
    .optional(),
  sortBy: z.enum(['createdAt', 'title', 'updatedAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc')
});

// Middleware de validation
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Données invalides',
          details: error.errors ? error.errors.map(err => ({
            field: err.path ? err.path.join('.') : 'unknown',
            message: err.message
          })) : []
        });
      }
      return res.status(500).json({ error: 'Erreur de validation' });
    }
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Paramètres de requête invalides',
          details: error.errors ? error.errors.map(err => ({
            field: err.path ? err.path.join('.') : 'unknown',
            message: err.message
          })) : []
        });
      }
      return res.status(500).json({ error: 'Erreur de validation' });
    }
  };
};