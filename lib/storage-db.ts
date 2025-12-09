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

export interface TaskOption {
  id: string;
  name: string;
  description: string;
  pointsRequired: number; // Valeur négative (ex: -20)
  emoji: string;
  category: string;
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

// Modifier directement le total de points (sans transaction)
export async function setPointsDirectly(totalPoints: number): Promise<boolean> {
  try {
    const response = await fetch('/api/points', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        totalPoints,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur setPointsDirectly:', error);
    return false;
  }
}

// Supprimer une transaction de l'historique
export async function deleteTransaction(transactionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/points?id=${transactionId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur deleteTransaction:', error);
    return false;
  }
}

// Réinitialiser la roue de la chance
export async function resetWheelOfFortune(): Promise<boolean> {
  try {
    const response = await fetch('/api/wheel-of-fortune', {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur resetWheelOfFortune:', error);
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
      pointsRequired: item.pointsRequired || item.points_required,
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

// Tâches (conversions négatives)
export async function getTasks(): Promise<TaskOption[]> {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      pointsRequired: item.pointsRequired,
      emoji: item.emoji,
      category: item.category,
    }));
  } catch (error) {
    console.error('Erreur getTasks:', error);
    return [];
  }
}

export async function addTask(task: Omit<TaskOption, 'id'>): Promise<boolean> {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: task.name,
        description: task.description,
        pointsRequired: task.pointsRequired,
        emoji: task.emoji,
        category: task.category,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur addTask:', error);
    return false;
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/tasks?id=${taskId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur deleteTask:', error);
    return false;
  }
}

// Bonus quotidien
export interface DailyBonusResult {
  bonusAwarded: boolean;
  amount?: number;
  days?: number;
  message: string;
  alreadyChecked?: boolean;
}

export async function checkDailyBonus(): Promise<DailyBonusResult> {
  try {
    const response = await fetch('/api/daily-bonus');
    if (!response.ok) {
      return { bonusAwarded: false, message: 'Erreur lors de la vérification du bonus' };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur checkDailyBonus:', error);
    return { bonusAwarded: false, message: 'Erreur lors de la vérification du bonus' };
  }
}

// Roue de la chance
export interface WheelOfFortuneStatus {
  canUse: boolean;
  lastUsed: string | null;
  daysSinceLastUse?: number;
  daysUntilNextUse: number;
}

export interface WheelOfFortuneResult {
  success: boolean;
  outcome?: number;
  totalPoints?: number;
  message?: string;
  error?: string;
  daysUntilNextUse?: number;
}

export async function getWheelStatus(): Promise<WheelOfFortuneStatus> {
  try {
    const response = await fetch('/api/wheel-of-fortune');
    if (!response.ok) {
      return { canUse: false, lastUsed: null, daysUntilNextUse: 0 };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur getWheelStatus:', error);
    return { canUse: false, lastUsed: null, daysUntilNextUse: 0 };
  }
}

export async function spinWheel(): Promise<WheelOfFortuneResult> {
  try {
    const response = await fetch('/api/wheel-of-fortune', {
      method: 'POST',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur spinWheel:', error);
    return { success: false, error: 'Erreur lors du lancement de la roue' };
  }
}


