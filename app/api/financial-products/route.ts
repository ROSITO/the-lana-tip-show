import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Récupérer tous les produits financiers
export async function GET() {
  try {
    await initDatabase();
    
    const products = await prisma.financialProduct.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products.map(p => ({
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      emoji: p.emoji,
      interestRate: Number(p.interestRate),
      durationDays: p.durationDays,
      active: p.active
    })));
  } catch (error: any) {
    console.error('Erreur API financial-products GET:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Créer un nouveau produit financier
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { name, description, emoji, interestRate, durationDays } = body;

    if (!name || !description || !emoji || interestRate === undefined || durationDays === undefined) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const rate = parseFloat(interestRate);
    const duration = parseInt(durationDays);

    if (isNaN(rate) || rate < 0 || rate > 100) {
      return NextResponse.json({ error: 'Taux d\'intérêt invalide (0-100%)' }, { status: 400 });
    }

    if (isNaN(duration) || duration < 1) {
      return NextResponse.json({ error: 'Durée invalide (minimum 1 jour)' }, { status: 400 });
    }

    const product = await prisma.financialProduct.create({
      data: {
        name,
        description,
        emoji,
        interestRate: rate,
        durationDays: duration,
        active: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      product: {
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        emoji: product.emoji,
        interestRate: Number(product.interestRate),
        durationDays: product.durationDays,
        active: product.active
      }
    });
  } catch (error: any) {
    console.error('Erreur API financial-products POST:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Supprimer un produit financier
export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de produit manquant' }, { status: 400 });
    }

    await prisma.financialProduct.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur API financial-products DELETE:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

