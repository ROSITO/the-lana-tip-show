// Script pour définir POSTGRES_URL à partir de lana_POSTGRES_URL si nécessaire
// Ce script doit être exécuté AVANT les commandes Prisma

if (!process.env.POSTGRES_URL) {
  // Essayer les variantes avec préfixe lana_ ou autres formats
  const dbUrl = process.env.lana_POSTGRES_URL || 
                process.env.PRISMA_DATABASE_URL ||
                process.env.lana_PRISMA_DATABASE_URL ||
                process.env.DATABASE_URL ||
                process.env.lana_DATABASE_URL;
  
  if (dbUrl) {
    // Définir POSTGRES_URL pour que Prisma puisse l'utiliser
    process.env.POSTGRES_URL = dbUrl;
    console.log('✅ POSTGRES_URL défini à partir de lana_POSTGRES_URL');
  } else {
    console.warn('⚠️ Aucune variable de base de données trouvée');
  }
} else {
  console.log('✅ POSTGRES_URL déjà défini');
}


