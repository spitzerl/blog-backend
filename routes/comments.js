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
  commentCreateSchema, 
  commentUpdateSchema, 
  paginationSchema,
  validateBody,
  validateQuery 
} from '../validation/schemas.js';
import { authenticateToken, requireOwnershipOrAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Obtenir tous les commentaires d'un post avec pagination
router.get('/post/:postId',
  validateQuery(paginationSchema),
  handleAsync(async (req, res) => {
    const { postId } = req.params;
    const { page, limit } = req.validatedQuery;

    if (!isValidId(postId)) {
      return errorResponse(res, 'ID de post invalide', 400);
    }

    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) }
    });

    if (!post) {
      return errorResponse(res, 'Post non trouvé', 404);
    }

    const offset = getPaginationOffset(page, limit);

    // Compter le total des commentaires
    const total = await prisma.comment.count({
      where: { postId: parseInt(postId) }
    });

    // Récupérer les commentaires
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const meta = getPaginationMeta(total, page, limit);

    return successResponse(res, {
      comments,
      meta
    });
  })
);

// Obtenir un commentaire spécifique
router.get('/:id',
  handleAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
      return errorResponse(res, 'ID de commentaire invalide', 400);
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!comment) {
      return errorResponse(res, 'Commentaire non trouvé', 404);
    }

    return successResponse(res, { comment });
  })
);

// Créer un nouveau commentaire
router.post('/',
  authenticateToken,
  validateBody(commentCreateSchema),
  handleAsync(async (req, res) => {
    const { content, postId } = req.validatedData;
    const authorId = req.user.id;

    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return errorResponse(res, 'Post non trouvé', 404);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
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
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return successResponse(res, { comment }, 'Commentaire créé avec succès', 201);
  })
);

// Mettre à jour un commentaire
router.put('/:id',
  authenticateToken,
  validateBody(commentUpdateSchema),
  requireOwnershipOrAdmin(async (req) => {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    return comment?.authorId;
  }),
  handleAsync(async (req, res) => {
    const { id } = req.params;
    const { content } = req.validatedData;

    if (!isValidId(id)) {
      return errorResponse(res, 'ID de commentaire invalide', 400);
    }

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return successResponse(res, { comment }, 'Commentaire mis à jour avec succès');
  })
);

// Supprimer un commentaire
router.delete('/:id',
  authenticateToken,
  requireOwnershipOrAdmin(async (req) => {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    return comment?.authorId;
  }),
  handleAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
      return errorResponse(res, 'ID de commentaire invalide', 400);
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });

    return successResponse(res, null, 'Commentaire supprimé avec succès', 204);
  })
);

export default router;