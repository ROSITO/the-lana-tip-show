#!/usr/bin/env node
// Script de build qui définit POSTGRES_URL avant d'exécuter Prisma

const { execSync } = require('child_process');

// Définir POSTGRES_URL si elle n'existe pas
if (!process.env.POSTGRES_URL) {
  const dbUrl = process.env.lana_POSTGRES_URL || 
                process.env.PRISMA_DATABASE_URL ||
                process.env.lana_PRISMA_DATABASE_URL ||
                process.env.DATABASE_URL ||
                process.env.lana_DATABASE_URL;
  
  if (dbUrl) {
    process.env.POSTGRES_URL = dbUrl;
    console.log('✅ POSTGRES_URL défini à partir de lana_POSTGRES_URL');
  } else {
    console.warn('⚠️ Aucune variable de base de données trouvée');
  }
} else {
  console.log('✅ POSTGRES_URL déjà défini');
}

// Exécuter les commandes dans l'ordre
try {
  console.log('📦 Génération du client Prisma...');
  execSync('prisma generate', { stdio: 'inherit', env: process.env });
  
  console.log('🚀 Application des migrations...');
  execSync('prisma migrate deploy', { stdio: 'inherit', env: process.env });
  
  console.log('🏗️  Build Next.js...');
  execSync('next build', { stdio: 'inherit', env: process.env });
  
  console.log('✅ Build terminé avec succès !');
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}


