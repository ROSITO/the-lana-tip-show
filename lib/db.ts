import { sql } from '@vercel/postgres';

// Initialisation des tables si elles n'existent pas
export async function initDatabase() {
  try {
    // Vérifier si les tables existent déjà
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('points', 'transactions', 'conversions', 'admin_password')
    `;
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    
    // Créer la table points si elle n'existe pas
    if (!existingTables.includes('points')) {
      try {
        await sql`
          CREATE TABLE points (
            id SERIAL PRIMARY KEY,
            total_points INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `;
        // Initialiser les points à 0
        await sql`INSERT INTO points (total_points) VALUES (0)`;
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    }

    // Créer la table transactions si elle n'existe pas
    if (!existingTables.includes('transactions')) {
      try {
        await sql`
          CREATE TABLE transactions (
            id SERIAL PRIMARY KEY,
            type TEXT NOT NULL CHECK (type IN ('add', 'remove')),
            amount INTEGER NOT NULL,
            reason TEXT NOT NULL,
            timestamp BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `;
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    }

    // Créer la table conversions si elle n'existe pas
    if (!existingTables.includes('conversions')) {
      try {
        await sql`
          CREATE TABLE conversions (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            points_required INTEGER NOT NULL,
            emoji TEXT NOT NULL,
            category TEXT NOT NULL CHECK (category IN ('money', 'activity', 'gift')),
            created_at TIMESTAMP DEFAULT NOW()
          );
        `;
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    }

    // Créer la table admin_password si elle n'existe pas
    if (!existingTables.includes('admin_password')) {
      try {
        await sql`
          CREATE TABLE admin_password (
            id SERIAL PRIMARY KEY,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `;
      } catch (e: any) {
        if (!e.message?.includes('already exists')) throw e;
      }
    }

    // Vérifier si les points sont initialisés
    try {
      const pointsCheck = await sql`SELECT COUNT(*)::int as count FROM points`;
      if (pointsCheck.rows[0]?.count === 0) {
        await sql`INSERT INTO points (total_points) VALUES (0)`;
      }
    } catch (e: any) {
      // Ignorer si la table n'existe pas encore
      if (!e.message?.includes('does not exist')) throw e;
    }
  } catch (error: any) {
    console.error('Erreur initialisation base de données:', error);
    throw error;
  }
}

