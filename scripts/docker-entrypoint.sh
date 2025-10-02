#!/bin/bash
set -e

echo "🚀 Démarrage de l'application blog-backend..."

# Attendre que la base de données soit disponible
echo "🔍 Vérification de la base de données..."
node scripts/wait-for-db.mjs

# Exécuter les migrations Prisma
echo "🔄 Exécution des migrations de base de données..."
npx prisma migrate deploy

# Exécuter le seeding (uniquement en production ou si SEED_DB=true)
if [ "$NODE_ENV" = "production" ] || [ "$SEED_DB" = "true" ]; then
  echo "🌱 Exécution du seeding de la base de données..."
  npm run db:seed
else
  echo "⏭️  Seeding ignoré (NODE_ENV=$NODE_ENV, SEED_DB=$SEED_DB)"
fi

# Démarrer l'application
echo "✨ Démarrage de l'application..."
exec npm start