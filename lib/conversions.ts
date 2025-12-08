// Système de conversion de points

export interface ConversionOption {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  emoji: string;
  category: 'money' | 'activity' | 'gift';
}

export const defaultConversionOptions: ConversionOption[] = [
  // Argent de poche
  {
    id: 'money-1',
    name: '1€ d\'argent de poche',
    description: 'Échange tes points contre de l\'argent !',
    pointsRequired: 10,
    emoji: '💰',
    category: 'money',
  },
  {
    id: 'money-2',
    name: '2€ d\'argent de poche',
    description: 'Encore plus d\'argent !',
    pointsRequired: 20,
    emoji: '💵',
    category: 'money',
  },
  {
    id: 'money-5',
    name: '5€ d\'argent de poche',
    description: 'Beaucoup d\'argent !',
    pointsRequired: 50,
    emoji: '💸',
    category: 'money',
  },
  
  // Sorties
  {
    id: 'activity-cinema',
    name: 'Sortie au cinéma',
    description: 'Aller voir un film au cinéma !',
    pointsRequired: 30,
    emoji: '🎬',
    category: 'activity',
  },
  {
    id: 'activity-park',
    name: 'Sortie au parc',
    description: 'Passer l\'après-midi au parc !',
    pointsRequired: 15,
    emoji: '🎠',
    category: 'activity',
  },
  {
    id: 'activity-icecream',
    name: 'Sortie pour une glace',
    description: 'Aller manger une glace !',
    pointsRequired: 10,
    emoji: '🍦',
    category: 'activity',
  },
  {
    id: 'activity-bowling',
    name: 'Sortie bowling',
    description: 'Jouer au bowling !',
    pointsRequired: 40,
    emoji: '🎳',
    category: 'activity',
  },
  
  // Cadeaux
  {
    id: 'gift-toy',
    name: 'Petit jouet',
    description: 'Un petit jouet de ton choix !',
    pointsRequired: 25,
    emoji: '🧸',
    category: 'gift',
  },
  {
    id: 'gift-book',
    name: 'Livre',
    description: 'Un livre de ton choix !',
    pointsRequired: 20,
    emoji: '📚',
    category: 'gift',
  },
  {
    id: 'gift-game',
    name: 'Jeu vidéo',
    description: 'Un jeu vidéo de ton choix !',
    pointsRequired: 100,
    emoji: '🎮',
    category: 'gift',
  },
  {
    id: 'gift-clothes',
    name: 'Vêtement',
    description: 'Un vêtement de ton choix !',
    pointsRequired: 35,
    emoji: '👗',
    category: 'gift',
  },
];

export function getConversionsByCategory(conversions: ConversionOption[]) {
  return {
    money: conversions.filter(c => c.category === 'money'),
    activity: conversions.filter(c => c.category === 'activity'),
    gift: conversions.filter(c => c.category === 'gift'),
  };
}

// Charger les conversions depuis le storage ou utiliser les valeurs par défaut
export function loadConversions(): ConversionOption[] {
  if (typeof window === 'undefined') {
    return defaultConversionOptions;
  }
  
  // Import dynamique pour éviter les problèmes de circular dependency
  const storage = require('./storage');
  const stored = storage.getConversions();
  
  // Si aucune conversion stockée, initialiser avec les valeurs par défaut
  if (stored.length === 0) {
    storage.saveConversions(defaultConversionOptions);
    return defaultConversionOptions;
  }
  
  return stored;
}

