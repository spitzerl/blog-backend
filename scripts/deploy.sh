#!/bin/bash

echo "🚀 Déploiement du Blog Backend en production"
echo "============================================="

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si le fichier .env.production existe
if [ ! -f ".env.production" ]; then
    echo "⚠️  Le fichier .env.production n'existe pas."
    echo "📝 Copie du fichier d'exemple..."
    cp .env.production .env.production.local
    echo "✅ Fichier .env.production.local créé. Veuillez le modifier avec vos valeurs de production."
    echo "🔧 Modification nécessaire des variables :"
    echo "   - JWT_SECRET (clé secrète longue et aléatoire)"
    echo "   - JWT_REFRESH_SECRET (autre clé secrète)"
    echo "   - ADMIN_EMAIL et ADMIN_PASSWORD"
    echo "   - DATABASE_URL si vous utilisez une DB externe"
    echo ""
    read -p "Appuyez sur Entrée après avoir modifié le fichier .env.production.local..."
    ENV_FILE=".env.production.local"
else
    ENV_FILE=".env.production"
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" down

# Construire et démarrer
echo "🔨 Construction et démarrage des conteneurs..."
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up --build -d

# Attendre le démarrage
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état
echo "📊 État des services :"
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" ps

echo ""
echo "✅ Déploiement terminé !"
echo "🌐 L'application devrait être disponible sur http://localhost:3001"
echo "📝 Logs : docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Arrêter : docker-compose -f docker-compose.prod.yml down"