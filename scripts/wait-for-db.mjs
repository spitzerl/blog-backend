#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function waitForDatabase() {
  const maxRetries = 60; // Plus de tentatives pour Dokploy
  let retries = 0;

  console.log('🔍 Vérification de la connexion à la base de données...');
  console.log('📋 URL de connexion:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@')); // Masquer le mot de passe

  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      console.log('✅ Connexion à la base de données établie !');
      
      // Vérifier que les tables existent
      try {
        await prisma.role.findFirst();
        console.log('✅ Tables de base de données disponibles !');
      } catch (tableError) {
        console.log('⚠️ Tables non trouvées, les migrations seront nécessaires');
      }
      
      await prisma.$disconnect();
      return true;
    } catch (error) {
      retries++;
      console.log(`⏳ Tentative ${retries}/${maxRetries} - Attente de la base de données...`);
      
      if (retries >= maxRetries) {
        console.error('❌ Impossible de se connecter à la base de données après', maxRetries, 'tentatives');
        console.error('📋 Variables d\'environnement:');
        console.error('   - NODE_ENV:', process.env.NODE_ENV);
        console.error('   - DATABASE_URL configurée:', !!process.env.DATABASE_URL);
        console.error('🚨 Erreur:', error.message);
        process.exit(1);
      }
      
      // Attente progressive: plus longue au début
      const waitTime = retries < 10 ? 3000 : 2000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

waitForDatabase();