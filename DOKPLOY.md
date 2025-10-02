# Guide de déploiement Dokploy

## 🚀 Configuration pour Dokploy

### 1. **Variables d'environnement à configurer dans Dokploy**

Copiez les variables depuis `.env.dokploy` et modifiez les valeurs suivantes :

```bash
# Base de données (remplacez par vos credentials Dokploy)
DATABASE_URL="postgresql://user:password@host:port/database"

# Sécurité (OBLIGATOIRE à changer)
JWT_SECRET="votre-secret-jwt-tres-long-et-aleatoire"
JWT_REFRESH_SECRET="votre-autre-secret-refresh-aussi-tres-long"

# Admin (modifiez ces valeurs)
ADMIN_EMAIL="votre-email@domain.com"
ADMIN_PASSWORD="VotreMotDePasseSecurise!"

# Environnement
NODE_ENV="production"
SEED_DB="true"
```

### 2. **Configuration du build Dokploy**

#### Build Command:
```bash
npm install && npm run postinstall
```

#### Start Command:
```bash
npm run start:dokploy
```

#### Port:
```
3001
```

### 3. **Configuration avancée (optionnel)**

Si vous voulez plus de contrôle, utilisez le script Docker :

#### Start Command alternatif:
```bash
chmod +x scripts/docker-entrypoint.sh && scripts/docker-entrypoint.sh
```

### 4. **Variables d'environnement importantes**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL complète de PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clé secrète JWT (min 32 chars) | `your-super-secret-jwt-key-change-me` |
| `ADMIN_EMAIL` | Email de l'admin initial | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Mot de passe admin initial | `SecurePassword123!` |
| `NODE_ENV` | Environnement | `production` |
| `SEED_DB` | Forcer le seeding | `true` |

### 5. **Vérifications post-déploiement**

Une fois déployé, vérifiez ces endpoints :

```bash
# Health check
curl https://your-app.dokploy.com/health

# API Posts
curl https://your-app.dokploy.com/api/posts

# Admin login
curl -X POST https://your-app.dokploy.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"VotreMotDePasse"}'
```

### 6. **Troubleshooting**

#### Erreur de connexion DB:
- Vérifiez `DATABASE_URL` dans les variables d'environnement Dokploy
- Assurez-vous que la base PostgreSQL est créée et accessible

#### Erreur de migration:
- Les logs montreront les détails dans Dokploy
- Le script attend automatiquement que la DB soit prête

#### Tables vides:
- Vérifiez que `SEED_DB=true` est défini
- Les données initiales sont créées automatiquement

### 7. **Sécurité**

⚠️ **IMPORTANT** : Changez obligatoirement ces valeurs en production :
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`  
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### 8. **Structure des logs**

Le déploiement affichera ces étapes :
```
🚀 Démarrage de l'application blog-backend...
🔍 Vérification de la base de données...
✅ Connexion à la base de données établie !
🔄 Exécution des migrations de base de données...
🌱 Exécution du seeding de la base de données...
✨ Démarrage de l'application sur le port 3001...
```