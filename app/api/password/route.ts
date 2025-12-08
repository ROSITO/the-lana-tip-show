import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initDatabase } from '@/lib/db';

// GET - Récupérer le mot de passe admin
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
    
    const adminPassword = await prisma.adminPassword.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // Si aucun mot de passe n'existe, retourner le mot de passe par défaut
    if (!adminPassword) {
      return NextResponse.json({ password: 'admin123' });
    }

    return NextResponse.json({ password: adminPassword.password });
  } catch (error: any) {
    console.error('Erreur API password:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST - Vérifier le mot de passe
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe manquant' }, { status: 400 });
    }

    const adminPassword = await prisma.adminPassword.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const correctPassword = adminPassword?.password || 'admin123';
    const isValid = password === correctPassword;

    return NextResponse.json({ valid: isValid });
  } catch (error: any) {
    console.error('Erreur API password POST:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// PUT - Changer le mot de passe
export async function PUT(request: NextRequest) {
  try {
    await initDatabase();
    
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 4 caractères' }, { status: 400 });
    }

    // Vérifier le mot de passe actuel
    const adminPassword = await prisma.adminPassword.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const correctPassword = adminPassword?.password || 'admin123';
    
    if (currentPassword !== correctPassword) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
    }

    // Mettre à jour ou créer le mot de passe
    if (adminPassword) {
      await prisma.adminPassword.update({
        where: { id: adminPassword.id },
        data: { password: newPassword }
      });
    } else {
      await prisma.adminPassword.create({
        data: { password: newPassword }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur API password PUT:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

