-- Script d'initialisation pour PostgreSQL
-- Ce script est exécuté automatiquement lors de la première création du conteneur

-- Créer l'utilisateur s'il n'existe pas déjà
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'bloguser') THEN

      CREATE ROLE bloguser LOGIN PASSWORD 'password';
   END IF;
END
$do$;

-- Accorder tous les privilèges sur la base de données
GRANT ALL PRIVILEGES ON DATABASE blogdb TO bloguser;
GRANT ALL ON SCHEMA public TO bloguser;