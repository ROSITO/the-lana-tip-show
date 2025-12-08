import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Récupérer les conversions
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
    
    const conversions = await prisma.conversion.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(conversions.map(c => ({
      id: c.id.toString(),
      name: c.name,
      description: c.description,
      pointsRequired: c.pointsRequired,
      emoji: c.emoji,
      category: c.category
    })));
  } catch (error: any) {
    console.error('Erreur API conversions:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Ajouter une conversion
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { name, description, pointsRequired, emoji, category } = body;

    if (!name || !description || !pointsRequired || !emoji || !category) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const conversion = await prisma.conversion.create({
      data: {
        name,
        description,
        pointsRequired: parseInt(pointsRequired),
        emoji,
        category: category as 'money' | 'activity' | 'gift'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        id: conversion.id.toString(),
        name: conversion.name,
        description: conversion.description,
        pointsRequired: conversion.pointsRequired,
        emoji: conversion.emoji,
        category: conversion.category
      }
    });
  } catch (error: any) {
    console.error('Erreur API POST conversions:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// DELETE - Supprimer une conversion
export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await prisma.conversion.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur API DELETE conversions:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

