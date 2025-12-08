import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { initDatabase } from '@/lib/db';

// GET - Récupérer les conversions
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
      SELECT id, name, description, points_required, emoji, category
      FROM conversions 
      ORDER BY created_at ASC
    `;

    return NextResponse.json(result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      pointsRequired: row.points_required,
      emoji: row.emoji,
      category: row.category
    })));
  } catch (error: any) {
    console.error('Erreur API conversions:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Ajouter une conversion
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { name, description, pointsRequired, emoji, category } = body;

    if (!name || !description || !pointsRequired || !emoji || !category) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO conversions (name, description, points_required, emoji, category)
      VALUES (${name}, ${description}, ${parseInt(pointsRequired)}, ${emoji}, ${category})
      RETURNING id, name, description, points_required, emoji, category
    `;

    return NextResponse.json({ 
      success: true, 
      data: {
        id: result.rows[0].id.toString(),
        name: result.rows[0].name,
        description: result.rows[0].description,
        pointsRequired: result.rows[0].points_required,
        emoji: result.rows[0].emoji,
        category: result.rows[0].category
      }
    });
  } catch (error) {
    console.error('Erreur API POST conversions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une conversion
export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await sql`
      DELETE FROM conversions 
      WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API DELETE conversions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

