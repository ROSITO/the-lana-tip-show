'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Gift, Coins, Star, Home, TrendingUp, TrendingDown, History, ListTodo, Zap, RotateCw, Wallet } from 'lucide-react';
import { getPointsData, getConversions, type ConversionOption, type PointTransaction, getTasks, type TaskOption, checkDailyBonus, getWheelStatus, spinWheel, type WheelOfFortuneResult, getBankBalance, exchangePoints } from '@/lib/storage-db';
import { getConversionsByCategory } from '@/lib/conversions';

export default function ChildPage() {
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [conversions, setConversions] = useState<ConversionOption[]>([]);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'money' | 'activity' | 'gift' | 'all'>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [dailyBonusMessage, setDailyBonusMessage] = useState<string>('');
  const [wheelStatus, setWheelStatus] = useState<{ canUse: boolean; daysUntilNextUse: number }>({ canUse: false, daysUntilNextUse: 0 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [bankBalance, setBankBalance] = useState(0);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'child') {
      router.push('/');
      return;
    }
    // Charger les données immédiatement
    loadData();
    // Vérifier le bonus quotidien au chargement
    checkDailyBonusOnLoad();
    // Vérifier le statut de la roue
    checkWheelStatus();
    // Recharger les données après un court délai pour s'assurer que le localStorage est prêt
    const timeout = setTimeout(() => {
      loadData();
    }, 100);
    
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
      clearTimeout(timeout);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [router]);

  const loadData = async () => {
    const data = await getPointsData();
    setPoints(data.totalPoints);
    setTransactions(data.transactions || []);
    const loadedConversions = await getConversions();
    setConversions(loadedConversions);
    const loadedTasks = await getTasks();
    setTasks(loadedTasks);
    const balance = await getBankBalance();
    setBankBalance(balance);
  };

  const checkDailyBonusOnLoad = async () => {
    const result = await checkDailyBonus();
    if (result.bonusAwarded) {
      setDailyBonusMessage(`🎉 ${result.message}`);
      // Recharger les données pour mettre à jour les points
      setTimeout(() => loadData(), 500);
    } else if (result.alreadyChecked) {
      setDailyBonusMessage('');
    } else {
      setDailyBonusMessage('');
    }
  };

  const checkWheelStatus = async () => {
    const status = await getWheelStatus();
    setWheelStatus(status);
  };

  const handleSpinWheel = async () => {
    if (!wheelStatus.canUse || isSpinning) return;
    
    setIsSpinning(true);
    const result: WheelOfFortuneResult = await spinWheel();
    
    if (result.success) {
      if (result.outcome && result.outcome > 0) {
        setDailyBonusMessage(`🎉 ${result.message}`);
      } else {
        setDailyBonusMessage(`😢 ${result.message}`);
      }
      // Recharger les données
      await loadData();
      await checkWheelStatus();
    } else {
      alert(result.error || 'Erreur lors du lancement de la roue');
    }
    
    setIsSpinning(false);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  };

  const handleGoHome = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  };

  const filteredOptions = selectedCategory === 'all' 
    ? conversions 
    : conversions.filter(opt => opt.category === selectedCategory);

  const canAfford = (option: ConversionOption) => points >= option.pointsRequired && points >= 0;
  
  const canDoTask = (task: TaskOption) => points <= task.pointsRequired; // points négatifs ou égaux à la tâche

  const categories = getConversionsByCategory(conversions);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={handleGoHome}
            className="absolute top-0 left-0 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            <Home className="w-5 h-5" />
            Accueil
          </button>
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
            <p className="text-3xl md:text-4xl mb-4 font-semibold">Tes points</p>
            <div className="flex items-center justify-center gap-4">
              <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 animate-bounce-slow" />
              <p className={`text-8xl md:text-9xl font-bold ${points < 0 ? 'text-red-200' : ''}`}>{points}</p>
              <Star className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 animate-bounce-slow" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="text-xl md:text-2xl mt-4">
              {points < 0 ? 'Il faut remonter la pente ! 💪' : points === 0 ? 'Tu peux faire mieux ! ⭐' : 'Continue comme ça ! 🌟'}
            </p>
          </div>
        </div>

        {/* Bank Account Display */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl text-center">
          <div className="text-white">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Wallet className="w-8 h-8 md:w-10 md:h-10" />
              <p className="text-2xl md:text-3xl font-semibold">Ton compte banque</p>
            </div>
            <p className="text-5xl md:text-7xl font-bold">{bankBalance.toFixed(2)}€</p>
            <p className="text-lg md:text-xl mt-3 opacity-90">
              💰 L'argent que tu as gagné en échangeant tes points !
            </p>
          </div>
        </div>

        {/* Daily Bonus Message */}
        {dailyBonusMessage && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-4 mb-6 shadow-xl text-center animate-bounce">
            <p className="text-xl font-bold text-white">{dailyBonusMessage}</p>
          </div>
        )}

        {/* Wheel of Fortune */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 mb-8 shadow-xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <RotateCw className="w-8 h-8" />
            🎡 Roue de la chance
          </h2>
          <p className="text-white mb-4">
            {wheelStatus.canUse 
              ? '🎉 Tu peux lancer la roue ! Gagne 1, 5 ou 10 points, ou perds 1 point...'
              : `⏳ Prochaine utilisation dans ${wheelStatus.daysUntilNextUse} jour${wheelStatus.daysUntilNextUse > 1 ? 's' : ''}`
            }
          </p>
          <button
            onClick={handleSpinWheel}
            disabled={!wheelStatus.canUse || isSpinning}
            className={`px-8 py-4 rounded-xl font-bold text-xl transition-all transform ${
              wheelStatus.canUse && !isSpinning
                ? 'bg-white text-purple-600 hover:scale-105 hover:shadow-2xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSpinning ? '⏳ Lancement...' : wheelStatus.canUse ? '🎰 Lancer la roue !' : '🔒 Indisponible'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
              showHistory
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            <History className="w-5 h-5" />
            {showHistory ? 'Masquer' : 'Voir'} l'historique
          </button>
          <button
            onClick={() => setShowTasks(!showTasks)}
            className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
              showTasks
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            <ListTodo className="w-5 h-5" />
            {showTasks ? 'Masquer' : 'Voir'} les tâches
          </button>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              📜 Historique de tes points
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">Aucune transaction pour le moment</p>
                  <p className="text-gray-400 text-sm mt-2">Les gains et pertes de points apparaîtront ici !</p>
                </div>
              ) : (
                transactions
                  .slice()
                  .reverse()
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        transaction.type === 'add'
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {transaction.type === 'add' ? (
                          <div className="bg-green-500 rounded-full p-2">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="bg-red-500 rounded-full p-2">
                            <TrendingDown className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-lg text-gray-800">
                            {transaction.type === 'add' ? '✨ ' : '⚠️ '}
                            {transaction.reason}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            transaction.type === 'add' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'add' ? '➕' : '➖'} {transaction.amount}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {transaction.type === 'add' ? 'Gagné !' : 'Perdu'}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Tasks Panel */}
        {showTasks && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              📋 Tâches disponibles
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Si tu as des points négatifs, tu peux faire ces tâches pour remonter !
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 text-lg">Aucune tâche disponible pour le moment</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const canDo = canDoTask(task);
                  return (
                    <div
                      key={task.id}
                      className={`relative rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 ${
                        canDo
                          ? 'bg-gradient-to-br from-orange-50 to-red-50 border-4 border-orange-300'
                          : 'bg-gray-200 opacity-60'
                      }`}
                    >
                      {!canDo && (
                        <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Pas assez de points négatifs
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-6xl mb-4">{task.emoji}</div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">{task.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm">{task.description}</p>
                        <div className={`inline-block px-4 py-2 rounded-xl font-bold text-lg ${
                          canDo
                            ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                            : 'bg-gray-400 text-gray-700'
                        }`}>
                          {task.pointsRequired} points
                        </div>
                        {canDo && (
                          <div className="mt-4">
                            <div className="text-orange-600 font-semibold">
                              ✓ Tu peux faire cette tâche !
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              (Demande à un adulte pour valider)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

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
                      <div className="text-green-600 font-semibold mb-2">
                        ✓ Tu peux l'avoir !
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm(`Es-tu sûr de vouloir échanger ${option.pointsRequired} points contre "${option.name}" ?`)) {
                            const result = await exchangePoints(option.id);
                            if (result.success) {
                              setDailyBonusMessage(result.message || '✅ Échange réussi !');
                              await loadData();
                              setTimeout(() => setDailyBonusMessage(''), 3000);
                            } else {
                              alert(result.error || 'Erreur lors de l\'échange');
                            }
                          }
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                      >
                        Échanger ✨
                      </button>
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
            {points < 0 ? (
              <>⚠️ <strong>Attention :</strong> Tu as des points négatifs. Il faut remonter pour pouvoir échanger tes points !</>
            ) : (
              <>💡 <strong>Astuce :</strong> Plus tu accumules de points, plus tu pourras échanger contre de super choses !</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

