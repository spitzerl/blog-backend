#!/bin/bash

# Script de test pour vérifier le bon fonctionnement de l'application
# Utilisez ce script après déploiement pour valider l'installation

echo "🧪 Tests de validation du déploiement Blog Backend"
echo "================================================="

# Configuration
BASE_URL="${1:-http://localhost:3001}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo "🌐 URL de test: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Test Health Check..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"'; then
    echo "✅ Health Check: OK"
else
    echo "❌ Health Check: FAILED"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi

# Test 2: API Posts (lecture)
echo ""
echo "2️⃣ Test API Posts..."
POSTS_RESPONSE=$(curl -s "$BASE_URL/api/posts?limit=1")
if echo "$POSTS_RESPONSE" | grep -q '"success":true'; then
    POSTS_COUNT=$(echo "$POSTS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "✅ API Posts: OK ($POSTS_COUNT posts trouvés)"
else
    echo "❌ API Posts: FAILED"
    echo "Response: $POSTS_RESPONSE"
    exit 1
fi

# Test 3: Login Admin
echo ""
echo "3️⃣ Test Login Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    echo "✅ Login Admin: OK"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Login Admin: FAILED"
    echo "Response: $LOGIN_RESPONSE"
    echo "Vérifiez ADMIN_EMAIL et ADMIN_PASSWORD dans vos variables d'environnement"
    exit 1
fi

# Test 4: API protégée (création de post)
echo ""
echo "4️⃣ Test API protégée (création post)..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "title": "Test Post Deployment",
        "content": "Ceci est un post de test créé lors du test de déploiement.",
        "excerpt": "Test de déploiement"
    }')

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Création Post: OK"
    POST_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    # Nettoyer le post de test
    curl -s -X DELETE "$BASE_URL/api/posts/$POST_ID" \
        -H "Authorization: Bearer $TOKEN" > /dev/null
    echo "🧹 Post de test supprimé"
else
    echo "❌ Création Post: FAILED"
    echo "Response: $CREATE_RESPONSE"
fi

# Test 5: Variables d'environnement critiques
echo ""
echo "5️⃣ Test Variables d'environnement..."
if [ "$NODE_ENV" = "production" ]; then
    echo "✅ NODE_ENV: production"
else
    echo "⚠️  NODE_ENV: $NODE_ENV (devrait être 'production' en déploiement)"
fi

if [ ${#JWT_SECRET} -gt 20 ]; then
    echo "✅ JWT_SECRET: configuré (longueur OK)"
else
    echo "❌ JWT_SECRET: trop court ou non configuré (sécurité compromise!)"
fi

echo ""
echo "🎉 Tests terminés !"
echo ""
echo "📋 Résumé des endpoints disponibles:"
echo "   🔍 Health: $BASE_URL/health"
echo "   📚 Posts: $BASE_URL/api/posts"
echo "   🔐 Auth: $BASE_URL/api/auth/login"
echo "   💬 Comments: $BASE_URL/api/comments"
echo ""
echo "📖 Documentation: Voir DOKPLOY.md pour plus d'informations"