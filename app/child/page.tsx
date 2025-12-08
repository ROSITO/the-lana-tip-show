'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Gift, Coins, Star } from 'lucide-react';
import { getPointsData } from '@/lib/storage';
import { loadConversions, getConversionsByCategory, type ConversionOption } from '@/lib/conversions';

export default function ChildPage() {
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [conversions, setConversions] = useState<ConversionOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'money' | 'activity' | 'gift' | 'all'>('all');

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'child') {
      router.push('/');
      return;
    }
    loadData();
    
    // Écouter les changements de localStorage pour les conversions
    const handleStorageChange = () => {
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement les changements (pour le même onglet)
    const interval = setInterval(() => {
      loadData();
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [router]);

  const loadData = () => {
    const data = getPointsData();
    setPoints(data.totalPoints);
    const loadedConversions = loadConversions();
    setConversions(loadedConversions);
  };

  const filteredOptions = selectedCategory === 'all' 
    ? conversions 
    : conversions.filter(opt => opt.category === selectedCategory);

  const canAfford = (option: ConversionOption) => points >= option.pointsRequired;

  const categories = getConversionsByCategory(conversions);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
            ✨ Salut Lana ! ✨
          </h1>
          <div className="flex justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Points Display */}
        <div className="bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl text-center animate-pulse-glow">
          <div className="text-white">
            <p className="text-3xl md:text-4xl mb-4 font-semibold">Tes points magiques</p>
            <div className="flex items-center justify-center gap-4">
              <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 animate-bounce-slow" />
              <p className="text-8xl md:text-9xl font-bold">{points}</p>
              <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 animate-bounce-slow" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="text-xl md:text-2xl mt-4">Continue comme ça ! 🌟</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            Tout voir
          </button>
          <button
            onClick={() => setSelectedCategory('money')}
            className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
              selectedCategory === 'money'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            <Coins className="w-5 h-5" />
            Argent
          </button>
          <button
            onClick={() => setSelectedCategory('activity')}
            className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
              selectedCategory === 'activity'
                ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-xl'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            <Star className="w-5 h-5" />
            Sorties
          </button>
          <button
            onClick={() => setSelectedCategory('gift')}
            className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
              selectedCategory === 'gift'
                ? 'bg-gradient-to-r from-pink-400 to-red-500 text-white shadow-xl'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            <Gift className="w-5 h-5" />
            Cadeaux
          </button>
        </div>

        {/* Conversion Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOptions.map((option) => {
            const affordable = canAfford(option);
            return (
              <div
                key={option.id}
                className={`relative rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 ${
                  affordable
                    ? 'bg-gradient-to-br from-white to-gray-50 border-4 border-transparent hover:border-pink-300'
                    : 'bg-gray-200 opacity-60'
                }`}
              >
                {!affordable && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Pas assez de points
                  </div>
                )}
                <div className="text-center">
                  <div className="text-6xl mb-4">{option.emoji}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{option.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{option.description}</p>
                  <div className={`inline-block px-4 py-2 rounded-xl font-bold text-lg ${
                    affordable
                      ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white'
                      : 'bg-gray-400 text-gray-700'
                  }`}>
                    {option.pointsRequired} points
                  </div>
                  {affordable && (
                    <div className="mt-4">
                      <div className="text-green-600 font-semibold">
                        ✓ Tu peux l'avoir !
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-xl text-center">
          <p className="text-lg text-gray-700">
            💡 <strong>Astuce :</strong> Plus tu accumules de points, plus tu pourras échanger contre de super choses !
          </p>
        </div>
      </div>
    </div>
  );
}

