import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Récupérer l'historique des transactions bancaires
export async function GET() {
  try {
    await initDatabase();
    
    const transactions = await prisma.bankTransaction.findMany({
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json(transactions.map(t => ({
      id: t.id.toString(),
      type: t.type as 'credit' | 'debit',
      amount: Number(t.amount),
      reason: t.reason,
      timestamp: Number(t.timestamp)
    })));
  } catch (error: any) {
    console.error('Erreur API bank transactions GET:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Supprimer une transaction bancaire
export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de transaction manquant' }, { status: 400 });
    }

    await prisma.bankTransaction.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur API bank transactions DELETE:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

