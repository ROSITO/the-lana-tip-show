import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { initDatabase } from '@/lib/db';

// GET - Récupérer le mot de passe admin
export async function GET() {
  try {
    try {
      await initDatabase();
    } catch (initError: any) {
      if (!initError.message?.includes('already exists')) {
        console.error('Erreur init database:', initError);
        return NextResponse.json({ 
          error: 'Erreur d\'initialisation de la base de données',
          details: process.env.NODE_ENV === 'development' ? initError.message : undefined
        }, { status: 500 });
      }
    }
    
    const result = await sql`
      SELECT password FROM admin_password 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    // Si aucun mot de passe n'existe, retourner le mot de passe par défaut
    if (result.rows.length === 0) {
      return NextResponse.json({ password: 'admin123' });
    }

    return NextResponse.json({ password: result.rows[0].password });
  } catch (error: any) {
    console.error('Erreur API password:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Vérifier le mot de passe
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe manquant' }, { status: 400 });
    }

    const result = await sql`
      SELECT password FROM admin_password 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const correctPassword = result.rows[0]?.password || 'admin123';
    const isValid = password === correctPassword;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Erreur API password POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Changer le mot de passe
export async function PUT(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 4 caractères' }, { status: 400 });
    }

    // Vérifier le mot de passe actuel
    const result = await sql`
      SELECT id, password FROM admin_password 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const correctPassword = result.rows[0]?.password || 'admin123';
    
    if (currentPassword !== correctPassword) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
    }

    // Mettre à jour ou créer le mot de passe
    if (result.rows.length > 0) {
      await sql`
        UPDATE admin_password 
        SET password = ${newPassword}, updated_at = NOW()
        WHERE id = ${result.rows[0].id}
      `;
    } else {
      await sql`
        INSERT INTO admin_password (password)
        VALUES (${newPassword})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API password PUT:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

