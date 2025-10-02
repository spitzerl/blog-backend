#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function waitForDatabase() {
  const maxRetries = 30;
  let retries = 0;

  console.log('🔍 Vérification de la connexion à la base de données...');

  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      console.log('✅ Connexion à la base de données établie !');
      await prisma.$disconnect();
      return true;
    } catch (error) {
      retries++;
      console.log(`⏳ Tentative ${retries}/${maxRetries} - Attente de la base de données...`);
      
      if (retries >= maxRetries) {
        console.error('❌ Impossible de se connecter à la base de données après', maxRetries, 'tentatives');
        console.error('Erreur:', error.message);
        process.exit(1);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

waitForDatabase();