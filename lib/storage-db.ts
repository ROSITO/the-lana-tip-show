// Nouveau système de stockage utilisant Supabase via les API routes

export interface PointTransaction {
  id: string;
  type: 'add' | 'remove';
  amount: number;
  reason: string;
  timestamp: number;
}

export interface PointsData {
  totalPoints: number;
  transactions: PointTransaction[];
}

export interface ConversionOption {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  emoji: string;
  category: 'money' | 'activity' | 'gift';
}

// Points
export async function getPointsData(): Promise<PointsData> {
  try {
    const response = await fetch('/api/points');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des points');
    }
    const data = await response.json();
    return {
      totalPoints: data.totalPoints || 0,
      transactions: data.transactions || []
    };
  } catch (error) {
    console.error('Erreur getPointsData:', error);
    return { totalPoints: 0, transactions: [] };
  }
}

export async function addPoints(amount: number, reason: string): Promise<boolean> {
  try {
    const response = await fetch('/api/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'add',
        amount,
        reason,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur addPoints:', error);
    return false;
  }
}

export async function removePoints(amount: number, reason: string): Promise<boolean> {
  try {
    const response = await fetch('/api/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'remove',
        amount: Math.abs(amount),
        reason,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur removePoints:', error);
    return false;
  }
}

// Conversions
export async function getConversions(): Promise<ConversionOption[]> {
  try {
    const response = await fetch('/api/conversions');
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      pointsRequired: item.points_required,
      emoji: item.emoji,
      category: item.category,
    }));
  } catch (error) {
    console.error('Erreur getConversions:', error);
    return [];
  }
}

export async function addConversion(conversion: Omit<ConversionOption, 'id'>): Promise<boolean> {
  try {
    const response = await fetch('/api/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: conversion.name,
        description: conversion.description,
        pointsRequired: conversion.pointsRequired,
        emoji: conversion.emoji,
        category: conversion.category,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur addConversion:', error);
    return false;
  }
}

export async function deleteConversion(conversionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/conversions?id=${conversionId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur deleteConversion:', error);
    return false;
  }
}

// Mot de passe admin
export async function getAdminPassword(): Promise<string> {
  try {
    const response = await fetch('/api/password');
    if (!response.ok) {
      return 'admin123';
    }
    const data = await response.json();
    return data.password || 'admin123';
  } catch (error) {
    console.error('Erreur getAdminPassword:', error);
    return 'admin123';
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Erreur verifyAdminPassword:', error);
    return false;
  }
}

export async function setAdminPassword(newPassword: string, currentPassword: string): Promise<boolean> {
  try {
    const response = await fetch('/api/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur setAdminPassword:', error);
    return false;
  }
}

