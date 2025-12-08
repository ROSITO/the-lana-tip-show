import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Route pour vérifier la connexion à la base de données
export async function GET() {
  try {
    // Test simple de connexion
    await sql`SELECT 1 as test`;
    
    // Vérifier si les tables existent
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('points', 'transactions', 'conversions', 'admin_password')
    `;
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    const requiredTables = ['points', 'transactions', 'conversions', 'admin_password'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    return NextResponse.json({
      connected: true,
      tables: {
        existing: existingTables,
        missing: missingTables,
        allPresent: missingTables.length === 0
      },
      message: missingTables.length === 0 
        ? 'Base de données connectée et toutes les tables sont présentes ✅'
        : `Base de données connectée mais certaines tables manquent: ${missingTables.join(', ')}`
    });
  } catch (error: any) {
    console.error('Erreur vérification base de données:', error);
    
    // Détecter le type d'erreur
    let errorMessage = 'Erreur de connexion à la base de données';
    let errorType = 'unknown';
    
    if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
      errorMessage = 'Les tables n\'existent pas encore. Elles seront créées au premier appel.';
      errorType = 'tables_missing';
    } else if (error.message?.includes('password') || error.message?.includes('authentication')) {
      errorMessage = 'Erreur d\'authentification à la base de données';
      errorType = 'auth_error';
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Impossible de se connecter à la base de données. Vérifiez les variables d\'environnement.';
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

