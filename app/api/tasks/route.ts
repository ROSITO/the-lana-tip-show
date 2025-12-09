import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Récupérer les tâches
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
    }
    
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(tasks.map(t => ({
      id: t.id.toString(),
      name: t.name,
      description: t.description,
      pointsRequired: t.pointsRequired, // Valeur négative
      emoji: t.emoji,
      category: t.category
    })));
  } catch (error: any) {
    console.error('Erreur API tasks:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Ajouter une tâche
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { name, description, pointsRequired, emoji, category } = body;

    if (!name || !description || !pointsRequired || !emoji || !category) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // S'assurer que pointsRequired est négatif
    const negativePoints = Math.abs(parseInt(pointsRequired)) * -1;

    const task = await prisma.task.create({
      data: {
        name,
        description,
        pointsRequired: negativePoints,
        emoji,
        category: category as string
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        id: task.id.toString(),
        name: task.name,
        description: task.description,
        pointsRequired: task.pointsRequired,
        emoji: task.emoji,
        category: task.category
      }
    });
  } catch (error: any) {
    console.error('Erreur API POST tasks:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Supprimer une tâche
export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur API DELETE tasks:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

