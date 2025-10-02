#!/bin/bash

# Script de gestion Docker pour le blog-backend
# Usage: ./scripts/docker-local.sh [start|stop|restart|logs|clean|test]

COMPOSE_FILE="docker-compose.dev.yml"
PROJECT_NAME="blog-backend-local"

show_usage() {
    echo "🐳 Script de gestion Docker pour Blog Backend"
    echo "============================================"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start     - Démarrer l'environnement complet"
    echo "  stop      - Arrêter tous les services"
    echo "  restart   - Redémarrer l'environnement"
    echo "  logs      - Afficher les logs en temps réel"
    echo "  logs-app  - Afficher uniquement les logs de l'app"
    echo "  logs-db   - Afficher uniquement les logs de la DB"
    echo "  clean     - Nettoyer (arrêter + supprimer volumes)"
    echo "  reset     - Reset complet (clean + rebuild)"
    echo "  test      - Tester l'application"
    echo "  status    - Voir l'état des services"
    echo "  shell     - Accéder au shell du backend"
    echo "  db-shell  - Accéder au shell PostgreSQL"
    echo ""
    echo "Exemples:"
    echo "  $0 start                    # Démarrer l'environnement"
    echo "  $0 logs-app                 # Voir les logs de l'app"
    echo "  $0 test                     # Tester l'API"
    echo ""
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker n'est pas installé"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose n'est pas disponible"
        exit 1
    fi
}

start_services() {
    echo "🚀 Démarrage de l'environnement Docker local..."
    echo "================================================"
    
    # Créer les dossiers nécessaires
    mkdir -p uploads logs
    
    # Démarrer les services
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build
    
    echo ""
    echo "⏳ Attente du démarrage des services..."
    sleep 10
    
    echo ""
    echo "📊 État des services:"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    
    echo ""
    echo "🎉 Environnement démarré !"
    echo "📖 Services disponibles:"
    echo "   🌐 Backend API: http://localhost:3001"
    echo "   🔍 Health check: http://localhost:3001/health"
    echo "   📚 API Posts: http://localhost:3001/api/posts"
    echo "   🗄️  Adminer DB: http://localhost:8080"
    echo ""
    echo "📋 Commandes utiles:"
    echo "   $0 logs       # Voir tous les logs"
    echo "   $0 test       # Tester l'API"
    echo "   $0 stop       # Arrêter les services"
}

stop_services() {
    echo "🛑 Arrêt des services..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    echo "✅ Services arrêtés"
}

restart_services() {
    echo "🔄 Redémarrage des services..."
    stop_services
    echo ""
    start_services
}

show_logs() {
    echo "📋 Affichage des logs (Ctrl+C pour quitter)..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
}

show_app_logs() {
    echo "📋 Logs de l'application (Ctrl+C pour quitter)..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f backend
}

show_db_logs() {
    echo "📋 Logs de la base de données (Ctrl+C pour quitter)..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f postgres
}

clean_environment() {
    echo "🧹 Nettoyage de l'environnement..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v --remove-orphans
    echo "✅ Environnement nettoyé"
}

reset_environment() {
    echo "🔄 Reset complet de l'environnement..."
    clean_environment
    echo ""
    echo "🧹 Suppression des images..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down --rmi all 2>/dev/null || true
    echo ""
    start_services
}

test_application() {
    echo "🧪 Test de l'application..."
    
    # Vérifier que l'app est démarrée
    if ! docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps | grep -q "blog-backend.*Up"; then
        echo "❌ L'application n'est pas démarrée. Lancez: $0 start"
        exit 1
    fi
    
    # Exécuter les tests
    if [ -f "scripts/test-deployment.sh" ]; then
        ./scripts/test-deployment.sh http://localhost:3001
    else
        echo "⚠️ Script de test non trouvé, test basique..."
        curl -s http://localhost:3001/health | jq . || curl -s http://localhost:3001/health
    fi
}

show_status() {
    echo "📊 État des services Docker:"
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    
    echo ""
    echo "🔍 Vérification des ports:"
    echo "Port 3001 (Backend): $(ss -tlnp | grep :3001 && echo "✅ Occupé" || echo "❌ Libre")"
    echo "Port 5432 (PostgreSQL): $(ss -tlnp | grep :5432 && echo "✅ Occupé" || echo "❌ Libre")"
    echo "Port 8080 (Adminer): $(ss -tlnp | grep :8080 && echo "✅ Occupé" || echo "❌ Libre")"
}

backend_shell() {
    echo "🐚 Accès au shell du backend..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec backend sh
}

db_shell() {
    echo "🗄️ Accès au shell PostgreSQL..."
    docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec postgres psql -U bloguser -d blogdb
}

# Main script
check_docker

case "${1:-}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    logs-app)
        show_app_logs
        ;;
    logs-db)
        show_db_logs
        ;;
    clean)
        clean_environment
        ;;
    reset)
        reset_environment
        ;;
    test)
        test_application
        ;;
    status)
        show_status
        ;;
    shell)
        backend_shell
        ;;
    db-shell)
        db_shell
        ;;
    *)
        show_usage
        exit 1
        ;;
esac