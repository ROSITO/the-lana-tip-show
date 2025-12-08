'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Shield, User, Lock } from 'lucide-react';
import { verifyAdminPassword } from '@/lib/storage';

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'child' | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Ne pas rediriger automatiquement - laisser l'utilisateur choisir son mode
  // Si l'utilisateur veut revenir à la page d'accueil, il peut se déconnecter depuis admin/child

  const handleRoleSelection = (role: 'admin' | 'child') => {
    if (role === 'admin') {
      setShowAdminLogin(true);
    } else {
      localStorage.setItem('userRole', role);
      setSelectedRole(role);
      router.push(`/${role}`);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(adminPassword)) {
      localStorage.setItem('userRole', 'admin');
      setSelectedRole('admin');
      setPasswordError(false);
      router.push('/admin');
    } else {
      setPasswordError(true);
      setAdminPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12 animate-bounce-slow">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            ✨ The Lana Tip Show ✨
          </h1>
          <div className="flex justify-center gap-2 mt-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Accès Admin</h2>
                <p className="text-gray-600">Entrez le mot de passe pour accéder au mode admin</p>
              </div>
              <form onSubmit={handleAdminLogin}>
                <div className="mb-4">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setPasswordError(false);
                    }}
                    placeholder="Mot de passe"
                    className={`w-full px-4 py-3 rounded-xl border-2 text-lg focus:outline-none ${
                      passwordError
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-red-500'
                    }`}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-2">❌ Mot de passe incorrect</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminPassword('');
                      setPasswordError(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    Se connecter 🔓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => handleRoleSelection('admin')}
            className="group relative p-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          >
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:bg-white/30 transition-all"></div>
            <div className="relative z-10">
              <Shield className="w-16 h-16 mx-auto mb-4 text-white" />
              <h2 className="text-3xl font-bold text-white mb-2">Mode Admin</h2>
              <p className="text-white/90 text-lg">Gérer les points</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm">Protégé par mot de passe</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelection('child')}
            className="group relative p-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          >
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:bg-white/30 transition-all"></div>
            <div className="relative z-10">
              <User className="w-16 h-16 mx-auto mb-4 text-white" />
              <h2 className="text-3xl font-bold text-white mb-2">Mode Lana</h2>
              <p className="text-white/90 text-lg">Voir mes points</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

