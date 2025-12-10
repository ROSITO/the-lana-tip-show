'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, LogOut, TrendingUp, TrendingDown, History, Gift, Trash2, X, Key, ListTodo, Edit2, RotateCw, Wallet } from 'lucide-react';
import { getPointsData, addPoints, removePoints, type PointTransaction, getConversions, addConversion, deleteConversion, type ConversionOption, getAdminPassword, setAdminPassword, verifyAdminPassword, getTasks, addTask, deleteTask, type TaskOption, setPointsDirectly, deleteTransaction, resetWheelOfFortune, getBankBalance, setBankBalance as setBankBalanceAPI, getBankTransactions, deleteBankTransaction, type BankTransaction } from '@/lib/storage-db';

export default function AdminPage() {
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [addAmount, setAddAmount] = useState('');
  const [addReason, setAddReason] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');
  const [removeReason, setRemoveReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showConversions, setShowConversions] = useState(false);
  const [conversions, setConversions] = useState<ConversionOption[]>([]);
  const [showAddConversion, setShowAddConversion] = useState(false);
  const [newConversion, setNewConversion] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    emoji: '',
    category: 'money' as 'money' | 'activity' | 'gift',
  });
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    emoji: '',
    category: 'chore',
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showEditPoints, setShowEditPoints] = useState(false);
  const [editPointsValue, setEditPointsValue] = useState('');
  const [bankBalance, setBankBalanceState] = useState(0);
  const [showEditBank, setShowEditBank] = useState(false);
  const [editBankValue, setEditBankValue] = useState('');
  const [editBankReason, setEditBankReason] = useState('');
  const [editBankWithHistory, setEditBankWithHistory] = useState(false);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [showBankHistory, setShowBankHistory] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      router.push('/');
      return;
    }
    // Charger les données immédiatement
    loadData();
    // Recharger les données après un court délai pour s'assurer que le localStorage est prêt
    const timeout = setTimeout(() => {
      loadData();
    }, 100);
    return () => clearTimeout(timeout);
  }, [router]);

  const loadData = async () => {
    const data = await getPointsData();
    setPoints(data.totalPoints);
    setTransactions(data.transactions.sort((a, b) => b.timestamp - a.timestamp));
    const loadedConversions = await getConversions();
    setConversions(loadedConversions);
    const loadedTasks = await getTasks();
    setTasks(loadedTasks);
    const balance = await getBankBalance();
    setBankBalanceState(balance);
    const loadedBankTransactions = await getBankTransactions();
    setBankTransactions(loadedBankTransactions);
  };

  const handleAddPoints = async () => {
    const pointsToAdd = parseInt(addAmount);
    if (!isNaN(pointsToAdd) && pointsToAdd !== 0 && addReason.trim()) {
      const success = await addPoints(pointsToAdd, addReason);
      if (success) {
        setAddAmount('');
        setAddReason('');
        await loadData();
      } else {
        alert('Erreur lors de l\'ajout des points');
      }
    }
  };

  const handleRemovePoints = async () => {
    const pointsToRemove = parseInt(removeAmount);
    // Accepter n'importe quelle valeur non-nulle (positive ou négative)
    // La fonction removePoints gérera la valeur absolue
    if (!isNaN(pointsToRemove) && pointsToRemove !== 0 && removeReason.trim()) {
      const success = await removePoints(pointsToRemove, removeReason);
      if (success) {
        setRemoveAmount('');
        setRemoveReason('');
        await loadData();
      } else {
        alert('Erreur lors de la suppression des points');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddConversion = async () => {
    if (
      newConversion.name.trim() &&
      newConversion.description.trim() &&
      newConversion.pointsRequired &&
      parseInt(newConversion.pointsRequired) > 0 &&
      newConversion.emoji.trim()
    ) {
      const success = await addConversion({
        name: newConversion.name,
        description: newConversion.description,
        pointsRequired: parseInt(newConversion.pointsRequired),
        emoji: newConversion.emoji,
        category: newConversion.category,
      });
      if (success) {
        setNewConversion({
          name: '',
          description: '',
          pointsRequired: '',
          emoji: '',
          category: 'money',
        });
        setShowAddConversion(false);
        await loadData();
      } else {
        alert('Erreur lors de la création de la conversion');
      }
    }
  };

  const handleDeleteConversion = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conversion ?')) {
      const success = await deleteConversion(id);
      if (success) {
        await loadData();
      } else {
        alert('Erreur lors de la suppression de la conversion');
      }
    }
  };

  const handleAddTask = async () => {
    if (
      newTask.name.trim() &&
      newTask.description.trim() &&
      newTask.pointsRequired &&
      parseInt(newTask.pointsRequired) > 0 &&
      newTask.emoji.trim()
    ) {
      const success = await addTask({
        name: newTask.name,
        description: newTask.description,
        pointsRequired: -parseInt(newTask.pointsRequired), // Négatif
        emoji: newTask.emoji,
        category: newTask.category,
      });
      if (success) {
        setNewTask({
          name: '',
          description: '',
          pointsRequired: '',
          emoji: '',
          category: 'chore',
        });
        setShowAddTask(false);
        await loadData();
      } else {
        alert('Erreur lors de la création de la tâche');
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      const success = await deleteTask(id);
      if (success) {
        await loadData();
      } else {
        alert('Erreur lors de la suppression de la tâche');
      }
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (newPassword.length < 4) {
      setPasswordError('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }
    
    const isValid = await verifyAdminPassword(currentPassword);
    if (!isValid) {
      setPasswordError('Mot de passe actuel incorrect');
      return;
    }
    
    const success = await setAdminPassword(newPassword, currentPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      alert('✅ Mot de passe changé avec succès !');
    } else {
      setPasswordError('Erreur lors du changement de mot de passe');
    }
  };

  const handleEditPoints = () => {
    setEditPointsValue(points.toString());
    setShowEditPoints(true);
  };

  const handleSavePoints = async () => {
    const newPoints = parseInt(editPointsValue);
    if (isNaN(newPoints)) {
      alert('Valeur invalide');
      return;
    }
    
    if (!confirm(`Êtes-vous sûr de vouloir modifier les points de ${points} à ${newPoints} ?\n\nCette modification ne créera pas de transaction dans l'historique.`)) {
      return;
    }
    
    const success = await setPointsDirectly(newPoints);
    if (success) {
      setShowEditPoints(false);
      setEditPointsValue('');
      await loadData();
      alert(`✅ Points modifiés avec succès : ${points} → ${newPoints}`);
    } else {
      alert('Erreur lors de la modification des points');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction de l\'historique ?\n\nNote: Les points totaux ne seront pas modifiés automatiquement.')) {
      return;
    }
    
    const success = await deleteTransaction(transactionId);
    if (success) {
      await loadData();
      alert('✅ Transaction supprimée avec succès');
    } else {
      alert('Erreur lors de la suppression de la transaction');
    }
  };

  const handleResetWheel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser la roue de la chance ?\n\nL\'enfant pourra l\'utiliser immédiatement.')) {
      return;
    }
    
    const success = await resetWheelOfFortune();
    if (success) {
      alert('✅ Roue de la chance réinitialisée avec succès');
    } else {
      alert('Erreur lors de la réinitialisation de la roue');
    }
  };

  const handleEditBank = () => {
    setEditBankValue(bankBalance.toFixed(2));
    setEditBankReason('');
    setEditBankWithHistory(false);
    setShowEditBank(true);
  };

  const handleSaveBank = async () => {
    const newBalance = parseFloat(editBankValue);
    if (isNaN(newBalance)) {
      alert('Valeur invalide');
      return;
    }
    
    const confirmMessage = editBankWithHistory
      ? `Êtes-vous sûr de vouloir modifier le solde de ${bankBalance.toFixed(2)}€ à ${newBalance.toFixed(2)}€ ?\n\nUne transaction sera créée dans l'historique.`
      : `Êtes-vous sûr de vouloir modifier le solde de ${bankBalance.toFixed(2)}€ à ${newBalance.toFixed(2)}€ ?\n\nCette modification ne créera pas de transaction dans l'historique.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    const success = await setBankBalanceAPI(
      newBalance,
      editBankWithHistory,
      editBankReason.trim() || undefined
    );
    if (success) {
      setShowEditBank(false);
      setEditBankValue('');
      setEditBankReason('');
      setEditBankWithHistory(false);
      await loadData();
      alert(`✅ Solde modifié avec succès : ${bankBalance.toFixed(2)}€ → ${newBalance.toFixed(2)}€`);
    } else {
      alert('Erreur lors de la modification du solde');
    }
  };

  const handleDeleteBankTransaction = async (transactionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction bancaire de l\'historique ?')) {
      return;
    }
    
    const success = await deleteBankTransaction(transactionId);
    if (success) {
      await loadData();
      alert('✅ Transaction bancaire supprimée avec succès');
    } else {
      alert('Erreur lors de la suppression de la transaction');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            🛡️ Mode Admin
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>

        {/* Points Display */}
        <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-8 mb-8 shadow-2xl text-center animate-pulse-glow">
          <div className="text-white">
            <div className="flex items-center justify-center gap-4 mb-2">
              <p className="text-2xl">Points totaux de Lana</p>
              <button
                onClick={handleEditPoints}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                title="Modifier directement les points"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            {/* Bank Account Display */}
            <div className="mt-6 pt-6 border-t border-white/30">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Wallet className="w-6 h-6" />
                <p className="text-xl">Compte banque</p>
                <button
                  onClick={handleEditBank}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  title="Modifier le solde"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {showEditBank ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <input
                    type="number"
                    step="0.01"
                    value={editBankValue}
                    onChange={(e) => setEditBankValue(e.target.value)}
                    className="text-4xl font-bold bg-white/20 border-2 border-white/50 rounded-xl px-4 py-2 text-center w-40 focus:outline-none focus:border-white"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="withHistory"
                      checked={editBankWithHistory}
                      onChange={(e) => setEditBankWithHistory(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="withHistory" className="text-sm opacity-90">
                      Créer une transaction dans l'historique
                    </label>
                  </div>
                  {editBankWithHistory && (
                    <input
                      type="text"
                      value={editBankReason}
                      onChange={(e) => setEditBankReason(e.target.value)}
                      placeholder="Raison (optionnel)"
                      className="w-64 px-3 py-2 bg-white/20 border-2 border-white/50 rounded-lg text-sm focus:outline-none focus:border-white"
                    />
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveBank}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-all"
                    >
                      ✓ Sauvegarder
                    </button>
                    <button
                      onClick={() => {
                        setShowEditBank(false);
                        setEditBankValue('');
                        setEditBankReason('');
                        setEditBankWithHistory(false);
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all"
                    >
                      ✕ Annuler
                    </button>
                  </div>
                  {!editBankWithHistory && (
                    <p className="text-xs opacity-80">⚠️ Cette modification ne créera pas de transaction dans l'historique</p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-4xl font-bold">{bankBalance.toFixed(2)}€</p>
                  <button
                    onClick={() => setShowBankHistory(!showBankHistory)}
                    className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all"
                  >
                    {showBankHistory ? 'Masquer' : 'Voir'} l'historique
                  </button>
                </>
              )}
            </div>
            {/* Bank History */}
            {showBankHistory && !showEditBank && (
              <div className="mt-4 pt-4 border-t border-white/30">
                <h3 className="text-lg font-semibold mb-3">Historique bancaire</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bankTransactions.length === 0 ? (
                    <p className="text-sm opacity-80 text-center py-4">Aucune transaction bancaire</p>
                  ) : (
                    bankTransactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                          transaction.type === 'credit' ? 'bg-green-500/30' : 'bg-red-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {transaction.type === 'credit' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-semibold">{transaction.reason}</span>
                        </div>
                        <span className={`font-bold ${
                          transaction.type === 'credit' ? 'text-green-200' : 'text-red-200'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {bankTransactions.length > 5 && (
                  <p className="text-xs opacity-80 text-center mt-2">
                    ... et {bankTransactions.length - 5} autre(s) transaction(s)
                  </p>
                )}
              </div>
            )}
            {showEditPoints ? (
              <div className="flex flex-col items-center gap-4">
                <input
                  type="number"
                  value={editPointsValue}
                  onChange={(e) => setEditPointsValue(e.target.value)}
                  className="text-7xl md:text-9xl font-bold bg-white/20 border-2 border-white/50 rounded-xl px-4 py-2 text-center w-48 md:w-64 focus:outline-none focus:border-white"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSavePoints}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-all"
                  >
                    ✓ Sauvegarder
                  </button>
                  <button
                    onClick={() => {
                      setShowEditPoints(false);
                      setEditPointsValue('');
                    }}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all"
                  >
                    ✕ Annuler
                  </button>
                </div>
                <p className="text-sm opacity-80">⚠️ Cette modification ne créera pas de transaction dans l'historique</p>
              </div>
            ) : (
              <p className="text-7xl md:text-9xl font-bold">{points}</p>
            )}
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold flex items-center gap-2 transition-all"
              >
                <History className="w-5 h-5" />
                Historique
              </button>
              <button
                onClick={() => setShowConversions(!showConversions)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold flex items-center gap-2 transition-all"
              >
                <Gift className="w-5 h-5" />
                Conversions
              </button>
              <button
                onClick={() => setShowTasks(!showTasks)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold flex items-center gap-2 transition-all"
              >
                <ListTodo className="w-5 h-5" />
                Tâches
              </button>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold flex items-center gap-2 transition-all"
              >
                <Key className="w-5 h-5" />
                Mot de passe
              </button>
            </div>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Historique des transactions (points)</h2>
              <button
                onClick={handleResetWheel}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
                title="Réinitialiser la roue de la chance"
              >
                <RotateCw className="w-5 h-5" />
                Réinitialiser la roue
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune transaction pour le moment</p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      transaction.type === 'add' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'add' ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold">{transaction.reason}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-xl font-bold ${
                          transaction.type === 'add' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'add' ? '+' : '-'}{transaction.amount}
                      </p>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                        title="Supprimer cette transaction"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bank History Panel */}
        {showBankHistory && !showEditBank && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Historique des transactions bancaires</h2>
              <button
                onClick={() => setShowBankHistory(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all"
              >
                Fermer
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bankTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune transaction bancaire pour le moment</p>
              ) : (
                bankTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      transaction.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'credit' ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <p className="font-semibold">{transaction.reason}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-xl font-bold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toFixed(2)}€
                      </p>
                      <button
                        onClick={() => handleDeleteBankTransaction(transaction.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                        title="Supprimer cette transaction"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Gestion des tâches (points négatifs)</h2>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                Ajouter une tâche
              </button>
            </div>

            {/* Add Task Form */}
            {showAddTask && (
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-6 mb-6 border-2 border-orange-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Nouvelle tâche</h3>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Nom</label>
                    <input
                      type="text"
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      placeholder="Ex: Ramasser les feuilles"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Emoji</label>
                    <input
                      type="text"
                      value={newTask.emoji}
                      onChange={(e) => setNewTask({ ...newTask, emoji: e.target.value })}
                      placeholder="Ex: 🍂"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Points requis (sera négatif)</label>
                    <input
                      type="number"
                      value={newTask.pointsRequired}
                      onChange={(e) => setNewTask({ ...newTask, pointsRequired: e.target.value })}
                      placeholder="Ex: 20"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Catégorie</label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="chore">🧹 Tâche ménagère</option>
                      <option value="homework">📚 Devoirs</option>
                      <option value="behavior">👤 Comportement</option>
                      <option value="other">📝 Autre</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">Description</label>
                    <input
                      type="text"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Ex: Ramasser toutes les feuilles du jardin"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddTask}
                  className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                >
                  Créer la tâche ✨
                </button>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune tâche pour le moment</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{task.emoji}</div>
                      <div>
                        <p className="font-bold text-lg text-gray-800">{task.name}</p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-red-600">
                            {task.pointsRequired} points
                          </span>
                          <span className="text-xs text-gray-500">
                            • {task.category === 'chore' ? '🧹 Tâche ménagère' : task.category === 'homework' ? '📚 Devoirs' : task.category === 'behavior' ? '👤 Comportement' : '📝 Autre'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                      Supprimer
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Conversions Panel */}
        {showConversions && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Gestion des conversions</h2>
              <button
                onClick={() => setShowAddConversion(!showAddConversion)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                Ajouter une conversion
              </button>
            </div>

            {/* Add Conversion Form */}
            {showAddConversion && (
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 mb-6 border-2 border-purple-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Nouvelle conversion</h3>
                  <button
                    onClick={() => setShowAddConversion(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Nom</label>
                    <input
                      type="text"
                      value={newConversion.name}
                      onChange={(e) => setNewConversion({ ...newConversion, name: e.target.value })}
                      placeholder="Ex: 1€ d'argent de poche"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Emoji</label>
                    <input
                      type="text"
                      value={newConversion.emoji}
                      onChange={(e) => setNewConversion({ ...newConversion, emoji: e.target.value })}
                      placeholder="Ex: 💰"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Points requis</label>
                    <input
                      type="number"
                      value={newConversion.pointsRequired}
                      onChange={(e) => setNewConversion({ ...newConversion, pointsRequired: e.target.value })}
                      placeholder="Ex: 10"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Catégorie</label>
                    <select
                      value={newConversion.category}
                      onChange={(e) => setNewConversion({ ...newConversion, category: e.target.value as 'money' | 'activity' | 'gift' })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="money">💰 Argent</option>
                      <option value="activity">⭐ Sortie</option>
                      <option value="gift">🎁 Cadeau</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">Description</label>
                    <input
                      type="text"
                      value={newConversion.description}
                      onChange={(e) => setNewConversion({ ...newConversion, description: e.target.value })}
                      placeholder="Ex: Échange tes points contre de l'argent !"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddConversion}
                  className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                >
                  Créer la conversion ✨
                </button>
              </div>
            )}

            {/* Conversions List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune conversion pour le moment</p>
              ) : (
                conversions.map((conversion) => (
                  <div
                    key={conversion.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{conversion.emoji}</div>
                      <div>
                        <p className="font-bold text-lg text-gray-800">{conversion.name}</p>
                        <p className="text-sm text-gray-600">{conversion.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-purple-600">
                            {conversion.pointsRequired} points
                          </span>
                          <span className="text-xs text-gray-500">
                            • {conversion.category === 'money' ? '💰 Argent' : conversion.category === 'activity' ? '⭐ Sortie' : '🎁 Cadeau'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteConversion(conversion.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                      Supprimer
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Password Change Panel */}
        {showPasswordChange && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Changer le mot de passe admin</h2>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Entrez le mot de passe actuel"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Au moins 4 caractères"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Retapez le nouveau mot de passe"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-500 focus:outline-none"
                />
              </div>
              {passwordError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-600 font-semibold">❌ {passwordError}</p>
                </div>
              )}
              <button
                onClick={handleChangePassword}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                Changer le mot de passe 🔐
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Points */}
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Ajouter des points
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Nombre de points</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Ex: 10"
                  className="w-full px-4 py-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Raison</label>
                <input
                  type="text"
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                  placeholder="Ex: Aide aux tâches ménagères"
                  className="w-full px-4 py-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <button
                onClick={handleAddPoints}
                className="w-full bg-white text-green-600 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Ajouter ✨
              </button>
            </div>
          </div>

          {/* Remove Points */}
          <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Minus className="w-6 h-6" />
              Enlever des points
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Nombre de points</label>
                <input
                  type="number"
                  value={removeAmount}
                  onChange={(e) => setRemoveAmount(e.target.value)}
                  placeholder="Ex: 5"
                  className="w-full px-4 py-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Raison</label>
                <input
                  type="text"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="Ex: Chambre non rangée"
                  className="w-full px-4 py-3 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <button
                onClick={handleRemovePoints}
                className="w-full bg-white text-red-600 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Enlever ⚠️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

