import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// POST - Échanger des points contre une conversion
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { conversionId } = body;

    if (!conversionId) {
      return NextResponse.json({ error: 'ID de conversion manquant' }, { status: 400 });
    }

    // Récupérer la conversion
    const conversion = await prisma.conversion.findUnique({
      where: { id: parseInt(conversionId) }
    });

    if (!conversion) {
      return NextResponse.json({ error: 'Conversion introuvable' }, { status: 404 });
    }

    // Récupérer les points actuels
    let points = await prisma.points.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const currentPoints = points?.totalPoints || 0;

    // Vérifier si l'enfant a assez de points
    if (currentPoints < conversion.pointsRequired || currentPoints < 0) {
      return NextResponse.json({ 
        error: 'Points insuffisants',
        required: conversion.pointsRequired,
        current: currentPoints
      }, { status: 400 });
    }

    // Retirer les points
    const newTotalPoints = currentPoints - conversion.pointsRequired;

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
        type: 'remove',
        amount: conversion.pointsRequired,
        reason: `Échange: ${conversion.name}`,
        timestamp: BigInt(Date.now())
      }
    });

    // Si c'est une conversion d'argent, créditer le compte banque
    if (conversion.category === 'money') {
      // Extraire le montant en euros du nom (ex: "1€ d'argent de poche" -> 1)
      const amountMatch = conversion.name.match(/(\d+(?:[.,]\d+)?)\s*€/);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(',', '.'));
        
        // Récupérer le compte banque
        let bankAccount = await prisma.bankAccount.findFirst({
          orderBy: { createdAt: 'desc' }
        });

        const newBalance = bankAccount 
          ? Number(bankAccount.balance) + amount
          : amount;

        if (bankAccount) {
          await prisma.bankAccount.update({
            where: { id: bankAccount.id },
            data: { balance: newBalance }
          });
        } else {
          await prisma.bankAccount.create({
            data: { balance: newBalance }
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      totalPoints: newTotalPoints,
      message: conversion.category === 'money' 
        ? `✅ ${conversion.name} ajouté à ton compte banque !`
        : `✅ ${conversion.name} échangé avec succès !`
    });
  } catch (error: any) {
    console.error('Erreur API exchange:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

