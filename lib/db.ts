import { prisma } from './prisma';

// Initialisation des tables - Prisma gère cela via les migrations
// Cette fonction vérifie juste que les données de base existent
export async function initDatabase() {
  try {
    // Vérifier si les points existent, sinon créer
    const pointsCount = await prisma.points.count();
    if (pointsCount === 0) {
      await prisma.points.create({
        data: {
          totalPoints: 0
        }
      });
    }
  } catch (error: any) {
    // Si les tables n'existent pas, c'est normal - elles doivent être créées via migrate
    if (error.message?.includes('does not exist') || 
        error.message?.includes('relation') || 
        error.code === 'P2021' || // Table does not exist
        error.code === 'P1001') { // Can't reach database
      console.warn('Les tables n\'existent pas encore.');
      throw new Error('Les tables n\'existent pas. Exécutez: npx prisma migrate deploy (en production) ou npx prisma migrate dev (en local)');
    }
    console.error('Erreur initialisation base de données:', error);
    throw error;
  }
}

