// Script pour initialiser la base de données
// Peut être exécuté manuellement ou via un build hook

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Vérification de la connexion à la base de données...');
    
    // Test de connexion
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier si les tables existent
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('points', 'transactions', 'conversions', 'admin_password')
    `;
    
    const existingTables = tables.map(t => t.tablename);
    const requiredTables = ['points', 'transactions', 'conversions', 'admin_password'];
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log(`📦 Tables manquantes détectées: ${missingTables.join(', ')}`);
      console.log('🚀 Création des tables via Prisma migrate...');
      
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Tables créées avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error);
        console.log('💡 Essayez manuellement: npx prisma migrate deploy');
        process.exit(1);
      }
    } else {
      console.log('✅ Toutes les tables existent déjà');
    }
    
    // Initialiser les points à 0 si nécessaire
    const pointsCount = await prisma.points.count();
    if (pointsCount === 0) {
      await prisma.points.create({ data: { totalPoints: 0 } });
      console.log('✅ Points initialisés à 0');
    }
    
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    if (error.message?.includes('P1001') || error.message?.includes('Can\'t reach')) {
      console.error('💡 Vérifiez que POSTGRES_URL est bien configurée');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

