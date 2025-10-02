import express from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  successResponse, 
  errorResponse,
  handleAsync,
  getPaginationMeta,
  getPaginationOffset,
  isValidId 
} from '../utils/helpers.js';
import { 
  postCreateSchema, 
  postUpdateSchema, 
  paginationSchema,
  searchSchema,
  validateBody,
  validateQuery 
} from '../validation/schemas.js';
import { authenticateToken, requireOwnershipOrAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Obtenir tous les posts avec pagination et recherche
router.get('/',
  validateQuery(paginationSchema.extend(searchSchema.shape)),
  handleAsync(async (req, res) => {
    const { page, limit, query, sortBy, sortOrder } = req.validatedQuery;
    const offset = getPaginationOffset(page, limit);

    // Construire les conditions de recherche
    const whereConditions = {};
    if (query) {
      whereConditions.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Compter le total
    const total = await prisma.post.count({
      where: whereConditions
    });

    // Récupérer les posts
    const posts = await prisma.post.findMany({
      where: whereConditions,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        comments: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit
    });

    const meta = getPaginationMeta(total, page, limit);

    return successResponse(res, {
      posts,
      meta
    });
  })
);

// Obtenir un post par son ID
router.get('/:id',
  handleAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
      return errorResponse(res, 'ID de post invalide', 400);
    }

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    if (!post) {
      return errorResponse(res, 'Post non trouvé', 404);
    }

    return successResponse(res, { post });
  })
);

// Créer un nouveau post
router.post('/',
  authenticateToken,
  validateBody(postCreateSchema),
  handleAsync(async (req, res) => {
    const { title, content, excerpt, coverImage } = req.validatedData;
    const authorId = req.user.id;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt,
        coverImage,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return successResponse(res, { post }, 'Post créé avec succès', 201);
  })
);

// Mettre à jour un post
router.put('/:id',
  authenticateToken,
  validateBody(postUpdateSchema),
  requireOwnershipOrAdmin(async (req) => {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    return post?.authorId;
  }),
  handleAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.validatedData;

    if (!isValidId(id)) {
      return errorResponse(res, 'ID de post invalide', 400);
    }

    // Enlever les champs undefined pour ne pas les passer à Prisma
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return successResponse(res, { post }, 'Post mis à jour avec succès');
  })
);

// Supprimer un post
router.delete('/:id',
  authenticateToken,
  requireOwnershipOrAdmin(async (req) => {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    return post?.authorId;
  }),
  handleAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
      return errorResponse(res, 'ID de post invalide', 400);
    }

    await prisma.post.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, null, 'Post supprimé avec succès', 204);
  })
);

// Recherche avancée de posts
router.get('/search/advanced',
  validateQuery(searchSchema),
  handleAsync(async (req, res) => {
    const { query, sortBy, sortOrder } = req.validatedQuery;

    if (!query) {
      return errorResponse(res, 'Terme de recherche requis', 400);
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { 
            author: { 
              email: { contains: query, mode: 'insensitive' } 
            } 
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder }
    });

    return successResponse(res, { 
      posts,
      searchTerm: query,
      count: posts.length 
    });
  })
);

export default router;