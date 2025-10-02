# 🐳 Guide Docker Local - Blog Backend

## Démarrage rapide

### 🚀 Lancer l'environnement complet
```bash
# Méthode 1: Script de gestion
./scripts/docker-local.sh start

# Méthode 2: npm
npm run docker:local
```

### 🛑 Arrêter l'environnement
```bash
./scripts/docker-local.sh stop
# ou
npm run docker:local:stop
```

## 📋 Services disponibles

Une fois démarré, vous aurez accès à :

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | http://localhost:3001 | API principale |
| **Health Check** | http://localhost:3001/health | Vérification santé |
| **API Posts** | http://localhost:3001/api/posts | Liste des articles |
| **Adminer DB** | http://localhost:8080 | Interface base de données |

### 🗄️ Connexion Adminer
- **Serveur** : `postgres`
- **Utilisateur** : `bloguser`  
- **Mot de passe** : `password`
- **Base** : `blogdb`

## 🔧 Commandes de gestion

```bash
# Voir l'état des services
./scripts/docker-local.sh status

# Voir les logs en temps réel
./scripts/docker-local.sh logs
./scripts/docker-local.sh logs-app    # Seulement l'app
./scripts/docker-local.sh logs-db     # Seulement la DB

# Tester l'application
./scripts/docker-local.sh test

# Redémarrer
./scripts/docker-local.sh restart

# Accéder au shell
./scripts/docker-local.sh shell       # Shell du backend
./scripts/docker-local.sh db-shell    # Shell PostgreSQL

# Nettoyage
./scripts/docker-local.sh clean       # Supprime les volumes
./scripts/docker-local.sh reset       # Reset complet + rebuild
```

## 🧪 Tests et validation

### Test automatique
```bash
./scripts/docker-local.sh test
```

### Tests manuels
```bash
# Health check
curl http://localhost:3001/health

# Lister les posts
curl http://localhost:3001/api/posts

# Login admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 🔍 Développement

### Logs de développement
```bash
# Suivre les logs de l'app
docker logs -f blog-backend

# Logs de la base de données  
docker logs -f blog-postgres
```

### Accès aux services

#### Backend Shell
```bash
docker exec -it blog-backend sh
```

#### PostgreSQL Shell  
```bash
docker exec -it blog-postgres psql -U bloguser -d blogdb
```

### Modifications du code
Les modifications sont appliquées automatiquement grâce au volume Docker. Pour forcer un rebuild :

```bash
./scripts/docker-local.sh restart
```

## 🗂️ Structure des volumes

```
blog-backend/
├── uploads/          # Fichiers uploadés (persistants)
├── logs/            # Logs de l'application  
└── postgres_data/   # Données PostgreSQL (Docker volume)
```

## ⚠️ Troubleshooting

### Port déjà utilisé
```bash
# Vérifier quels ports sont utilisés
ss -tlnp | grep -E ':3001|:5432|:8080'

# Arrêter les processus conflictuels
sudo fuser -k 3001/tcp
sudo fuser -k 5432/tcp
```

### Base de données corrompue
```bash
# Reset complet avec rebuild
./scripts/docker-local.sh reset
```

### Problèmes de permissions
```bash
# Réparer les permissions des dossiers
sudo chown -R $USER:$USER uploads logs
```

## 🎯 Différences avec la production

| Aspect | Docker Local | Production |
|--------|--------------|------------|
| **Base de données** | PostgreSQL Docker | PostgreSQL externe |
| **Variables env** | `.env.docker` | `.env.production` |
| **Seeding** | Automatique | Configurable |
| **Logs** | Stdout + fichiers | Selon config serveur |
| **Volumes** | Locaux | Persistants serveur |

## 🚀 Commandes rapides

```bash
# Setup complet en une commande
npm run docker:local

# Développement avec logs
npm run docker:local && npm run docker:local:logs

# Test après démarrage
npm run docker:local && sleep 10 && npm run docker:local:test

# Nettoyage complet
npm run docker:local:clean
```