import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Vérifier et attribuer le bonus quotidien si nécessaire
export async function GET() {
  try {
    await initDatabase();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Vérifier si un bonus a déjà été attribué aujourd'hui
    const todayBonus = await prisma.dailyBonus.findUnique({
      where: { date: today }
    });

    if (todayBonus?.checked) {
      return NextResponse.json({ 
        alreadyChecked: true,
        message: 'Bonus quotidien déjà attribué aujourd\'hui'
      });
    }

    // Vérifier les transactions d'hier
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayTransactions = await prisma.transaction.findMany({
      where: {
        timestamp: {
          gte: BigInt(yesterdayStart.getTime()),
          lte: BigInt(yesterdayEnd.getTime())
        }
      }
    });

    // Si aucune transaction hier, attribuer le bonus
    if (yesterdayTransactions.length === 0) {
      // Vérifier tous les jours manquants depuis la dernière vérification
      const lastChecked = await prisma.dailyBonus.findFirst({
        orderBy: { date: 'desc' },
        where: { checked: true }
      });

      let daysToCheck: Date[] = [];
      if (lastChecked) {
        // Vérifier depuis le jour après la dernière vérification jusqu'à hier
        const startDate = new Date(lastChecked.date);
        startDate.setDate(startDate.getDate() + 1);
        
        for (let d = new Date(startDate); d < today; d.setDate(d.getDate() + 1)) {
          const checkDate = new Date(d);
          checkDate.setHours(0, 0, 0, 0);
          
          // Vérifier les transactions de ce jour
          const dayStart = new Date(checkDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(checkDate);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayTransactions = await prisma.transaction.findMany({
            where: {
              timestamp: {
                gte: BigInt(dayStart.getTime()),
                lte: BigInt(dayEnd.getTime())
              }
            }
          });
          
          if (dayTransactions.length === 0) {
            daysToCheck.push(checkDate);
          }
        }
      } else {
        // Première fois, vérifier depuis hier
        daysToCheck.push(yesterday);
      }

      // Attribuer 1 point bonus pour chaque jour sans transaction
      if (daysToCheck.length > 0) {
        const bonusAmount = daysToCheck.length;
        
        // Ajouter les points
        let points = await prisma.points.findFirst({
          orderBy: { createdAt: 'desc' }
        });

        const newTotalPoints = (points?.totalPoints || 0) + bonusAmount;

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

        // Créer la transaction bonus
        await prisma.transaction.create({
          data: {
            type: 'add',
            amount: bonusAmount,
            reason: `Point${bonusAmount > 1 ? 's' : ''} bonus quotidien${bonusAmount > 1 ? ' (jours sans transaction)' : ''}`,
            timestamp: BigInt(Date.now())
          }
        });

        // Marquer tous les jours comme vérifiés
        for (const date of daysToCheck) {
          await prisma.dailyBonus.upsert({
            where: { date },
            create: { date, checked: true },
            update: { checked: true }
          });
        }

        // Marquer aujourd'hui comme vérifié
        await prisma.dailyBonus.upsert({
          where: { date: today },
          create: { date: today, checked: true },
          update: { checked: true }
        });

        return NextResponse.json({ 
          bonusAwarded: true,
          amount: bonusAmount,
          days: daysToCheck.length,
          message: `Bonus de ${bonusAmount} point${bonusAmount > 1 ? 's' : ''} attribué !`
        });
      }
    }

    // Marquer aujourd'hui comme vérifié même si pas de bonus
    await prisma.dailyBonus.upsert({
      where: { date: today },
      create: { date: today, checked: true },
      update: { checked: true }
    });

    return NextResponse.json({ 
      bonusAwarded: false,
      message: 'Aucun bonus à attribuer (transaction hier)'
    });
  } catch (error: any) {
    console.error('Erreur API daily-bonus:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

