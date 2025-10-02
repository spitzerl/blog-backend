# API Documentation - Blog Backend

## 🚀 Fonctionnalités implémentées

### ✅ Sécurité (Phase 1 - Critique)
- **Authentification JWT** avec tokens d'accès et de rafraîchissement
- **Validation robuste** avec Zod pour toutes les entrées
- **Protection des routes** avec middleware d'autorisation
- **Rate limiting** pour prévenir les attaques
- **Sécurité headers** avec Helmet
- **CORS** configuré
- **Hachage sécurisé** des mots de passe avec bcrypt

### ✅ Fonctionnalités (Phase 2)
- **CRUD Posts complet** avec pagination et recherche
- **CRUD Commentaires** avec relations
- **Pagination** sur tous les endpoints de listing
- **Recherche avancée** par titre, contenu, auteur
- **Permissions granulaires** (propriétaire + admin)

### ✅ Architecture
- **Structure modulaire** avec routes séparées
- **Middleware réutilisables**
- **Gestion d'erreurs centralisée**
- **Validation centralisée**
- **Utilitaires partagés**

## 🔐 Authentification

### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "MonMotDePasse123",
  "roleId": 2 // Optionnel, 2 = user par défaut
}
```

### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "MonMotDePasse123"
}
```

### Profil utilisateur
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

## 📝 Posts

### Lister les posts (avec pagination et recherche)
```http
GET /api/posts?page=1&limit=10&query=recherche&sortBy=createdAt&sortOrder=desc
```

### Obtenir un post
```http
GET /api/posts/:id
```

### Créer un post (authentifié)
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mon nouveau post",
  "content": "# Contenu en Markdown\n\nCeci est du contenu...",
  "excerpt": "Extrait du post",
  "coverImage": "https://example.com/image.jpg"
}
```

### Mettre à jour un post (propriétaire ou admin)
```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Titre modifié",
  "content": "Contenu modifié"
}
```

### Supprimer un post (propriétaire ou admin)
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Recherche avancée
```http
GET /api/posts/search/advanced?query=terme&sortBy=title&sortOrder=asc
```

## 💬 Commentaires

### Lister les commentaires d'un post
```http
GET /api/comments/post/:postId?page=1&limit=10
```

### Obtenir un commentaire
```http
GET /api/comments/:id
```

### Créer un commentaire (authentifié)
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Mon commentaire",
  "postId": 1
}
```

### Mettre à jour un commentaire (propriétaire ou admin)
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Commentaire modifié"
}
```

### Supprimer un commentaire (propriétaire ou admin)
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

## 📊 Réponses API

### Format de réponse succès
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Données retournées
  }
}
```

### Format de réponse erreur
```json
{
  "success": false,
  "error": "Message d'erreur",
  "details": [
    {
      "field": "email",
      "message": "L'adresse email n'est pas valide"
    }
  ]
}
```

### Pagination
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    }
  }
}
```

## 🔒 Permissions

### Rôles
- **admin**: Peut tout faire
- **user**: Peut créer du contenu et modifier le sien

### Règles d'autorisation
- **Posts**: 
  - Lecture: Public
  - Création: Utilisateurs connectés
  - Modification/Suppression: Propriétaire ou Admin
- **Commentaires**:
  - Lecture: Public  
  - Création: Utilisateurs connectés
  - Modification/Suppression: Propriétaire ou Admin

## ⚡ Rate Limiting

- **Général**: 100 requêtes/minute par IP
- **Authentification**: 5 tentatives/15 minutes par IP

## 🚀 Démarrage

1. **Installation des dépendances**
```bash
npm install
```

2. **Configuration de l'environnement**
```bash
cp backend/.env.example backend/.env
# Éditer les variables dans backend/.env
```

3. **Base de données**
```bash
npx prisma migrate deploy
npx prisma generate
npm run seed
```

4. **Démarrage du serveur**
```bash
cd backend && node index.js
```

Le serveur démarre sur `http://localhost:3001`

## 🔧 Variables d'environnement

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blog_db"
BACKEND_PORT=3001
JWT_SECRET="votre-secret-super-securise"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="votre-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

## 📈 Prochaines améliorations possibles

### Phase 3 - Optimisation
- [ ] Upload d'images
- [ ] Cache Redis
- [ ] Logging structuré
- [ ] Métriques et monitoring
- [ ] Tests automatisés
- [ ] Documentation OpenAPI/Swagger
- [ ] Notifications en temps réel
- [ ] Système de likes/réactions
- [ ] Modération des commentaires
- [ ] Export de données

## 🛡️ Sécurité en production

En production, assurez-vous de :
- [ ] Changer tous les secrets JWT
- [ ] Utiliser HTTPS uniquement  
- [ ] Configurer un reverse proxy (nginx)
- [ ] Activer les logs de sécurité
- [ ] Configurer un pare-feu
- [ ] Sauvegardes régulières de la base de données
- [ ] Monitoring des erreurs (Sentry)
- [ ] Variables d'environnement sécurisées
