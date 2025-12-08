import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Route pour vérifier la connexion à la base de données
export async function GET() {
  try {
    // Test simple de connexion avec Prisma
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Vérifier si les tables existent en essayant de les interroger
    const requiredTables = ['points', 'transactions', 'conversions', 'admin_password'];
    const existingTables: string[] = [];
    const missingTables: string[] = [];
    
    for (const table of requiredTables) {
      try {
        if (table === 'points') {
          await prisma.points.findFirst();
          existingTables.push(table);
        } else if (table === 'transactions') {
          await prisma.transaction.findFirst();
          existingTables.push(table);
        } else if (table === 'conversions') {
          await prisma.conversion.findFirst();
          existingTables.push(table);
        } else if (table === 'admin_password') {
          await prisma.adminPassword.findFirst();
          existingTables.push(table);
        }
      } catch (e: any) {
        if (e.message?.includes('does not exist') || e.message?.includes('relation')) {
          missingTables.push(table);
        } else {
          // Autre erreur, considérer que la table existe
          existingTables.push(table);
        }
      }
    }
    
    return NextResponse.json({
      connected: true,
      tables: {
        existing: existingTables,
        missing: missingTables,
        allPresent: missingTables.length === 0
      },
      message: missingTables.length === 0 
        ? 'Base de données connectée et toutes les tables sont présentes ✅'
        : `Base de données connectée mais certaines tables manquent: ${missingTables.join(', ')}. Exécutez: npx prisma migrate dev`
    });
  } catch (error: any) {
    console.error('Erreur vérification base de données:', error);
    
    // Détecter le type d'erreur
    let errorMessage = 'Erreur de connexion à la base de données';
    let errorType = 'unknown';
    
    if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
      errorMessage = 'Les tables n\'existent pas encore. Exécutez: npx prisma migrate dev';
      errorType = 'tables_missing';
    } else if (error.message?.includes('password') || error.message?.includes('authentication')) {
      errorMessage = 'Erreur d\'authentification à la base de données';
      errorType = 'auth_error';
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Impossible de se connecter à la base de données. Vérifiez les variables d\'environnement POSTGRES_URL.';
      errorType = 'connection_error';
    } else if (error.message?.includes('P1001') || error.message?.includes('Can\'t reach database')) {
      errorMessage = 'Impossible d\'atteindre la base de données. Vérifiez POSTGRES_URL.';
      errorType = 'connection_error';
    }
    
    return NextResponse.json({
      connected: false,
      error: errorMessage,
      errorType,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

