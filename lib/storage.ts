// Gestion du stockage des points et de l'historique

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

const STORAGE_KEY = 'lana_points_data';
const CONVERSIONS_STORAGE_KEY = 'lana_conversions_data';
const ADMIN_PASSWORD_KEY = 'lana_admin_password';

// Mot de passe admin par défaut (peut être changé depuis l'interface admin)
const DEFAULT_ADMIN_PASSWORD = 'admin123';

export function getPointsData(): PointsData {
  if (typeof window === 'undefined') {
    return { totalPoints: 0, transactions: [] };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Vérifier que les données sont valides
      if (parsed && typeof parsed.totalPoints === 'number' && Array.isArray(parsed.transactions)) {
        return parsed;
      } else {
        console.warn('Données corrompues dans localStorage, réinitialisation');
        const defaultData = { totalPoints: 0, transactions: [] };
        savePointsData(defaultData);
        return defaultData;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la lecture des points:', error);
  }
  
  return { totalPoints: 0, transactions: [] };
}

export function savePointsData(data: PointsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Vérification que les données ont bien été sauvegardées
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      console.error('Erreur: Les données n\'ont pas pu être sauvegardées dans localStorage');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des points:', error);
  }
}

export function addPoints(amount: number, reason: string): void {
  if (typeof window === 'undefined') return;
  const data = getPointsData();
  data.totalPoints += amount;
  data.transactions.push({
    id: Date.now().toString(),
    type: 'add',
    amount,
    reason,
    timestamp: Date.now(),
  });
  savePointsData(data);
  // Vérification immédiate que les données ont été sauvegardées
  const verify = getPointsData();
  if (verify.totalPoints !== data.totalPoints) {
    console.error('Erreur de persistance: les points n\'ont pas été sauvegardés correctement');
  }
}

export function removePoints(amount: number, reason: string): void {
  if (typeof window === 'undefined') return;
  const data = getPointsData();
  // Toujours soustraire la valeur absolue pour enlever des points
  // Si amount est négatif, on prend sa valeur absolue pour enlever quand même
  const pointsToRemove = Math.abs(amount);
  data.totalPoints = data.totalPoints - pointsToRemove; // Permet les valeurs négatives après soustraction
  data.transactions.push({
    id: Date.now().toString(),
    type: 'remove',
    amount: pointsToRemove,
    reason,
    timestamp: Date.now(),
  });
  savePointsData(data);
  // Vérification immédiate que les données ont été sauvegardées
  const verify = getPointsData();
  if (verify.totalPoints !== data.totalPoints) {
    console.error('Erreur de persistance: les points n\'ont pas été sauvegardés correctement');
  }
}

// Gestion des conversions
export function getConversions(): ConversionOption[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const stored = localStorage.getItem(CONVERSIONS_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return [];
}

export function saveConversions(conversions: ConversionOption[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONVERSIONS_STORAGE_KEY, JSON.stringify(conversions));
}

export function addConversion(conversion: ConversionOption): void {
  const conversions = getConversions();
  conversions.push(conversion);
  saveConversions(conversions);
}

export function deleteConversion(conversionId: string): void {
  const conversions = getConversions();
  const filtered = conversions.filter(c => c.id !== conversionId);
  saveConversions(filtered);
}

// Gestion du mot de passe admin
export function getAdminPassword(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_ADMIN_PASSWORD;
  }
  
  const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
  if (stored) {
    return stored;
  }
  
  // Initialiser avec le mot de passe par défaut
  localStorage.setItem(ADMIN_PASSWORD_KEY, DEFAULT_ADMIN_PASSWORD);
  return DEFAULT_ADMIN_PASSWORD;
}

export function setAdminPassword(password: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

export function verifyAdminPassword(password: string): boolean {
  const correctPassword = getAdminPassword();
  return password === correctPassword;
}

