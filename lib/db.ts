import { sql } from '@vercel/postgres';

// Initialisation des tables si elles n'existent pas
export async function initDatabase() {
  try {
    // Créer la table points si elle n'existe pas
    await sql`
      CREATE TABLE IF NOT EXISTS points (
        id SERIAL PRIMARY KEY,
        total_points INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Créer la table transactions si elle n'existe pas
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('add', 'remove')),
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Créer la table conversions si elle n'existe pas
    await sql`
      CREATE TABLE IF NOT EXISTS conversions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        points_required INTEGER NOT NULL,
        emoji TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('money', 'activity', 'gift')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Créer la table admin_password si elle n'existe pas
    await sql`
      CREATE TABLE IF NOT EXISTS admin_password (
        id SERIAL PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Initialiser les points à 0 si aucune ligne n'existe
    const pointsCheck = await sql`SELECT COUNT(*) as count FROM points`;
    if (pointsCheck.rows[0].count === '0') {
      await sql`INSERT INTO points (total_points) VALUES (0)`;
    }
  } catch (error) {
    console.error('Erreur initialisation base de données:', error);
  }
}

