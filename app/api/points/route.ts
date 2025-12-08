import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { initDatabase } from '@/lib/db';

// GET - Récupérer les points
export async function GET() {
  try {
    await initDatabase();
    
    const pointsResult = await sql`
      SELECT total_points FROM points 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const totalPoints = pointsResult.rows[0]?.total_points || 0;

    const transactionsResult = await sql`
      SELECT id, type, amount, reason, timestamp 
      FROM transactions 
      ORDER BY timestamp DESC
    `;

    return NextResponse.json({
      totalPoints,
      transactions: transactionsResult.rows.map(row => ({
        id: row.id.toString(),
        type: row.type,
        amount: row.amount,
        reason: row.reason,
        timestamp: Number(row.timestamp)
      }))
    });
  } catch (error) {
    console.error('Erreur API points:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter ou enlever des points
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { type, amount, reason } = body; // type: 'add' | 'remove'

    if (!type || !amount || !reason) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Récupérer les points actuels
    const pointsResult = await sql`
      SELECT id, total_points FROM points 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    let newTotalPoints = 0;
    if (pointsResult.rows.length > 0) {
      const currentPoints = pointsResult.rows[0].total_points;
      newTotalPoints = type === 'add' 
        ? currentPoints + amount 
        : currentPoints - Math.abs(amount);
      
      // Mettre à jour les points
      await sql`
        UPDATE points 
        SET total_points = ${newTotalPoints}, updated_at = NOW()
        WHERE id = ${pointsResult.rows[0].id}
      `;
    } else {
      newTotalPoints = type === 'add' ? amount : -Math.abs(amount);
      await sql`
        INSERT INTO points (total_points) 
        VALUES (${newTotalPoints})
      `;
    }

    // Ajouter la transaction
    await sql`
      INSERT INTO transactions (type, amount, reason, timestamp)
      VALUES (${type}, ${type === 'add' ? amount : Math.abs(amount)}, ${reason}, ${Date.now()})
    `;

    return NextResponse.json({ success: true, totalPoints: newTotalPoints });
  } catch (error) {
    console.error('Erreur API POST points:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

