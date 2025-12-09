import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Récupérer les points
export async function GET() {
  try {
    try {
      await initDatabase();
    } catch (initError: any) {
      if (initError.message?.includes('migrate')) {
        return NextResponse.json({ 
          error: 'Les tables n\'existent pas encore',
          hint: 'Exécutez: npx prisma migrate dev'
        }, { status: 500 });
      }
      console.error('Erreur init database:', initError);
    }
    
    const points = await prisma.points.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const totalPoints = points?.totalPoints || 0;

    const transactions = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json({
      totalPoints,
      transactions: transactions.map(t => ({
        id: t.id.toString(),
        type: t.type as 'add' | 'remove',
        amount: t.amount,
        reason: t.reason,
        timestamp: Number(t.timestamp)
      }))
    });
  } catch (error: any) {
    console.error('Erreur API points:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      hint: error.message?.includes('relation') || error.message?.includes('does not exist') 
        ? 'Les tables n\'existent pas encore. Exécutez: npx prisma migrate dev' 
        : undefined
    }, { status: 500 });
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
    let points = await prisma.points.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    let newTotalPoints = 0;
    if (points) {
      newTotalPoints = type === 'add' 
        ? points.totalPoints + amount 
        : points.totalPoints - Math.abs(amount);
      
      // Mettre à jour les points
      points = await prisma.points.update({
        where: { id: points.id },
        data: { totalPoints: newTotalPoints }
      });
    } else {
      newTotalPoints = type === 'add' ? amount : -Math.abs(amount);
      points = await prisma.points.create({
        data: { totalPoints: newTotalPoints }
      });
    }

    // Ajouter la transaction
    await prisma.transaction.create({
      data: {
        type: type as 'add' | 'remove',
        amount: type === 'add' ? amount : Math.abs(amount),
        reason,
        timestamp: BigInt(Date.now())
      }
    });

    return NextResponse.json({ success: true, totalPoints: newTotalPoints });
  } catch (error: any) {
    console.error('Erreur API POST points:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Modifier directement le total de points (sans transaction)
export async function PUT(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { totalPoints } = body;

    if (totalPoints === undefined || totalPoints === null) {
      return NextResponse.json({ error: 'Nombre de points manquant' }, { status: 400 });
    }

    const newTotalPoints = parseInt(totalPoints);
    if (isNaN(newTotalPoints)) {
      return NextResponse.json({ error: 'Nombre de points invalide' }, { status: 400 });
    }

    // Récupérer les points actuels
    let points = await prisma.points.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (points) {
      // Mettre à jour les points
      points = await prisma.points.update({
        where: { id: points.id },
        data: { totalPoints: newTotalPoints }
      });
    } else {
      // Créer une nouvelle entrée
      points = await prisma.points.create({
        data: { totalPoints: newTotalPoints }
      });
    }

    return NextResponse.json({ success: true, totalPoints: newTotalPoints });
  } catch (error: any) {
    console.error('Erreur API PUT points:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Supprimer une transaction de l'historique
export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de transaction manquant' }, { status: 400 });
    }

    // Récupérer la transaction pour connaître son impact
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 });
    }

    // Supprimer la transaction
    await prisma.transaction.delete({
      where: { id: parseInt(id) }
    });

    // Note: On ne modifie pas les points totaux car cela pourrait créer des incohérences
    // L'admin peut utiliser la fonction d'édition directe si nécessaire

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur API DELETE points:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

