#!/bin/bash
set -e

echo "🚀 Démarrage de l'application blog-backend..."
echo "🌍 Environnement: ${NODE_ENV:-development}"
echo "🔧 Port: ${PORT:-3001}"

# Attendre que la base de données soit disponible
echo "🔍 Vérification de la base de données..."
node scripts/wait-for-db.mjs

# Générer le client Prisma (au cas où)
echo "⚙️  Génération du client Prisma..."
npx prisma generate

# Exécuter les migrations Prisma
echo "🔄 Exécution des migrations de base de données..."
npx prisma migrate deploy

# Vérifier si la base est vide pour décider du seeding
echo "🔍 Vérification de l'état de la base de données..."
ROLE_COUNT=$(node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.role.count().then(count => {
  console.log(count);
  prisma.\$disconnect();
}).catch(() => {
  console.log(0);
  prisma.\$disconnect();
});
" 2>/dev/null || echo "0")

# Exécuter le seeding si nécessaire
if [ "$NODE_ENV" = "production" ] || [ "$SEED_DB" = "true" ] || [ "$ROLE_COUNT" = "0" ]; then
  echo "🌱 Exécution du seeding de la base de données..."
  npm run db:seed
else
  echo "⏭️  Seeding ignoré (NODE_ENV=$NODE_ENV, SEED_DB=$SEED_DB, ROLES_EXIST=$ROLE_COUNT)"
fi

# Démarrer l'application
echo "✨ Démarrage de l'application sur le port ${PORT:-3001}..."
exec npm start