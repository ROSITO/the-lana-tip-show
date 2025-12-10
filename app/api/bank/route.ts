import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Récupérer le solde du compte banque
export async function GET() {
  try {
    await initDatabase();
    
    const account = await prisma.bankAccount.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const balance = account ? Number(account.balance) : 0;

    return NextResponse.json({ balance });
  } catch (error: any) {
    console.error('Erreur API bank GET:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Modifier le solde du compte banque (avec ou sans historique)
export async function PUT(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { balance, createTransaction } = body;

    if (balance === undefined || balance === null) {
      return NextResponse.json({ error: 'Solde manquant' }, { status: 400 });
    }

    const newBalance = parseFloat(balance);
    if (isNaN(newBalance)) {
      return NextResponse.json({ error: 'Solde invalide' }, { status: 400 });
    }

    // Récupérer le compte actuel
    let account = await prisma.bankAccount.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const oldBalance = account ? Number(account.balance) : 0;
    const difference = newBalance - oldBalance;

    if (account) {
      // Mettre à jour le compte
      account = await prisma.bankAccount.update({
        where: { id: account.id },
        data: { balance: newBalance }
      });
    } else {
      // Créer un nouveau compte
      account = await prisma.bankAccount.create({
        data: { balance: newBalance }
      });
    }

    // Créer une transaction dans l'historique si demandé
    if (createTransaction && difference !== 0) {
      await prisma.bankTransaction.create({
        data: {
          type: difference > 0 ? 'credit' : 'debit',
          amount: Math.abs(difference),
          reason: body.reason || (difference > 0 ? 'Ajout manuel' : 'Retrait manuel'),
          timestamp: BigInt(Date.now())
        }
      });
    }

    return NextResponse.json({ success: true, balance: Number(account.balance) });
  } catch (error: any) {
    console.error('Erreur API bank PUT:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Ajouter de l'argent au compte (pour les conversions)
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { amount } = body;

    if (amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Montant manquant' }, { status: 400 });
    }

    const addAmount = parseFloat(amount);
    if (isNaN(addAmount) || addAmount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Récupérer le compte actuel
    let account = await prisma.bankAccount.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const newBalance = account 
      ? Number(account.balance) + addAmount
      : addAmount;

    if (account) {
      // Mettre à jour le compte
      account = await prisma.bankAccount.update({
        where: { id: account.id },
        data: { balance: newBalance }
      });
    } else {
      // Créer un nouveau compte
      account = await prisma.bankAccount.create({
        data: { balance: newBalance }
      });
    }

    // Créer une transaction dans l'historique
    await prisma.bankTransaction.create({
      data: {
        type: 'credit',
        amount: addAmount,
        reason: body.reason || 'Conversion de points',
        timestamp: BigInt(Date.now())
      }
    });

    return NextResponse.json({ success: true, balance: Number(account.balance) });
  } catch (error: any) {
    console.error('Erreur API bank POST:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

