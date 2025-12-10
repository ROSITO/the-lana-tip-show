import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// Fonction pour calculer les intérêts quotidiens
function calculateDailyInterest(amount: number, annualRate: number): number {
  // Taux quotidien = taux annuel / 365
  return (amount * annualRate) / 100 / 365;
}

// Fonction pour calculer le montant actuel avec intérêts
function calculateCurrentAmount(investment: any): number {
  const startDate = new Date(investment.startDate);
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const initialAmount = Number(investment.initialAmount);
  const annualRate = Number(investment.product.interestRate);
  
  // Calcul des intérêts composés quotidiens
  const dailyRate = annualRate / 100 / 365;
  const currentAmount = initialAmount * Math.pow(1 + dailyRate, daysElapsed);
  
  return currentAmount;
}

// GET - Récupérer tous les investissements actifs avec calcul des intérêts
export async function GET() {
  try {
    await initDatabase();
    
    const investments = await prisma.investment.findMany({
      where: { status: 'active' },
      include: { product: true },
      orderBy: { startDate: 'desc' }
    });

    const now = new Date();
    const investmentsWithInterest = investments.map(inv => {
      const currentAmount = calculateCurrentAmount(inv);
      const initialAmount = Number(inv.initialAmount);
      const interestEarned = currentAmount - initialAmount;
      const daysElapsed = Math.floor((now.getTime() - new Date(inv.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = Math.floor((new Date(inv.maturityDate).getTime() - new Date(inv.startDate).getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: inv.id.toString(),
        productId: inv.productId.toString(),
        productName: inv.product.name,
        productEmoji: inv.product.emoji,
        initialAmount: initialAmount,
        currentAmount: currentAmount,
        interestEarned: interestEarned,
        startDate: inv.startDate.toISOString(),
        maturityDate: inv.maturityDate.toISOString(),
        daysElapsed: daysElapsed,
        totalDays: totalDays,
        progress: Math.min(100, (daysElapsed / totalDays) * 100)
      };
    });

    return NextResponse.json(investmentsWithInterest);
  } catch (error: any) {
    console.error('Erreur API investments GET:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Créer un nouvel investissement
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { productId, amount } = body;

    if (!productId || amount === undefined) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const investAmount = parseFloat(amount);
    if (isNaN(investAmount) || investAmount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Vérifier que le produit existe et est actif
    const product = await prisma.financialProduct.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit financier introuvable' }, { status: 404 });
    }

    if (!product.active) {
      return NextResponse.json({ error: 'Ce produit financier n\'est plus disponible' }, { status: 400 });
    }

    // Vérifier que l'enfant a assez d'argent
    const bankAccount = await prisma.bankAccount.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const currentBalance = bankAccount ? Number(bankAccount.balance) : 0;
    if (currentBalance < investAmount) {
      return NextResponse.json({ 
        error: 'Solde insuffisant',
        currentBalance,
        required: investAmount
      }, { status: 400 });
    }

    // Calculer la date d'échéance
    const startDate = new Date();
    const maturityDate = new Date(startDate);
    maturityDate.setDate(maturityDate.getDate() + product.durationDays);

    // Débiter le compte bancaire
    const newBalance = currentBalance - investAmount;
    await prisma.bankAccount.update({
      where: { id: bankAccount!.id },
      data: { balance: newBalance }
    });

    // Créer la transaction bancaire
    await prisma.bankTransaction.create({
      data: {
        type: 'debit',
        amount: investAmount,
        reason: `Investissement: ${product.name}`,
        timestamp: BigInt(Date.now())
      }
    });

    // Créer l'investissement
    const investment = await prisma.investment.create({
      data: {
        productId: parseInt(productId),
        amount: investAmount,
        initialAmount: investAmount,
        startDate,
        maturityDate,
        status: 'active'
      },
      include: { product: true }
    });

    return NextResponse.json({ 
      success: true,
      investment: {
        id: investment.id.toString(),
        productName: investment.product.name,
        amount: Number(investment.amount),
        maturityDate: investment.maturityDate.toISOString()
      },
      newBalance
    });
  } catch (error: any) {
    console.error('Erreur API investments POST:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Libérer un investissement à l'échéance (appelé par un cron job ou manuellement)
export async function PUT(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { investmentId } = body;

    if (!investmentId) {
      return NextResponse.json({ error: 'ID d\'investissement manquant' }, { status: 400 });
    }

    const investment = await prisma.investment.findUnique({
      where: { id: parseInt(investmentId) },
      include: { product: true }
    });

    if (!investment) {
      return NextResponse.json({ error: 'Investissement introuvable' }, { status: 404 });
    }

    if (investment.status === 'completed') {
      return NextResponse.json({ error: 'Cet investissement a déjà été libéré' }, { status: 400 });
    }

    // Calculer le montant final avec intérêts
    const finalAmount = calculateCurrentAmount(investment);

    // Créditer le compte bancaire
    const bankAccount = await prisma.bankAccount.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const newBalance = bankAccount 
      ? Number(bankAccount.balance) + finalAmount
      : finalAmount;

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

    // Créer la transaction bancaire
    await prisma.bankTransaction.create({
      data: {
        type: 'credit',
        amount: finalAmount,
        reason: `Libération investissement: ${investment.product.name} (+ intérêts)`,
        timestamp: BigInt(Date.now())
      }
    });

    // Marquer l'investissement comme terminé
    await prisma.investment.update({
      where: { id: parseInt(investmentId) },
      data: { 
        status: 'completed',
        amount: finalAmount
      }
    });

    return NextResponse.json({ 
      success: true,
      finalAmount: Number(finalAmount),
      interestEarned: Number(finalAmount) - Number(investment.initialAmount),
      newBalance
    });
  } catch (error: any) {
    console.error('Erreur API investments PUT:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

