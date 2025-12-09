import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Vérifier si la roue peut être utilisée
export async function GET() {
  try {
    await initDatabase();
    
    const wheel = await prisma.wheelOfFortune.findFirst({
      orderBy: { lastUsed: 'desc' }
    });

    if (!wheel) {
      return NextResponse.json({ 
        canUse: true,
        lastUsed: null,
        daysUntilNextUse: 0
      });
    }

    const lastUsed = new Date(wheel.lastUsed);
    const now = new Date();
    const daysSinceLastUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
    const canUse = daysSinceLastUse >= 7;

    return NextResponse.json({ 
      canUse,
      lastUsed: lastUsed.toISOString(),
      daysSinceLastUse,
      daysUntilNextUse: canUse ? 0 : 7 - daysSinceLastUse
    });
  } catch (error: any) {
    console.error('Erreur API wheel-of-fortune GET:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Lancer la roue de la chance
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    // Vérifier si la roue peut être utilisée
    const wheel = await prisma.wheelOfFortune.findFirst({
      orderBy: { lastUsed: 'desc' }
    });

    if (wheel) {
      const lastUsed = new Date(wheel.lastUsed);
      const now = new Date();
      const daysSinceLastUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastUse < 7) {
        return NextResponse.json({ 
          error: 'La roue ne peut être utilisée qu\'une fois par semaine',
          daysUntilNextUse: 7 - daysSinceLastUse
        }, { status: 400 });
      }
    }

    // Lancer la roue : 1, 5, 10 points ou -1 point
    const outcomes = [1, 5, 10, -1];
    const weights = [40, 30, 20, 10]; // Probabilités en pourcentage
    const random = Math.random() * 100;
    
    let cumulative = 0;
    let selectedOutcome = outcomes[0];
    for (let i = 0; i < outcomes.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        selectedOutcome = outcomes[i];
        break;
      }
    }

    // Mettre à jour ou créer l'entrée de la roue
    if (wheel) {
      await prisma.wheelOfFortune.update({
        where: { id: wheel.id },
        data: { lastUsed: new Date() }
      });
    } else {
      await prisma.wheelOfFortune.create({
        data: { lastUsed: new Date() }
      });
    }

    // Ajouter ou retirer les points
    let points = await prisma.points.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const newTotalPoints = (points?.totalPoints || 0) + selectedOutcome;

    if (points) {
      await prisma.points.update({
        where: { id: points.id },
        data: { totalPoints: newTotalPoints }
      });
    } else {
      await prisma.points.create({
        data: { totalPoints: newTotalPoints }
      });
    }

    // Créer la transaction
    await prisma.transaction.create({
      data: {
        type: selectedOutcome > 0 ? 'add' : 'remove',
        amount: Math.abs(selectedOutcome),
        reason: `Roue de la chance : ${selectedOutcome > 0 ? '+' : ''}${selectedOutcome} point${Math.abs(selectedOutcome) > 1 ? 's' : ''}`,
        timestamp: BigInt(Date.now())
      }
    });

    return NextResponse.json({ 
      success: true,
      outcome: selectedOutcome,
      totalPoints: newTotalPoints,
      message: selectedOutcome > 0 
        ? `🎉 Tu as gagné ${selectedOutcome} point${selectedOutcome > 1 ? 's' : ''} !`
        : `😢 Tu as perdu 1 point...`
    });
  } catch (error: any) {
    console.error('Erreur API wheel-of-fortune POST:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Réinitialiser la roue de la chance
export async function DELETE() {
  try {
    await initDatabase();
    
    const wheel = await prisma.wheelOfFortune.findFirst({
      orderBy: { lastUsed: 'desc' }
    });

    if (wheel) {
      await prisma.wheelOfFortune.delete({
        where: { id: wheel.id }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Roue de la chance réinitialisée'
    });
  } catch (error: any) {
    console.error('Erreur API wheel-of-fortune DELETE:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

