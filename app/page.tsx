'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Shield, User } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'child' | null>(null);

  useEffect(() => {
    // Vérifier si un rôle est déjà sélectionné
    const savedRole = localStorage.getItem('userRole');
    if (savedRole === 'admin' || savedRole === 'child') {
      router.push(`/${savedRole}`);
    }
  }, [router]);

  const handleRoleSelection = (role: 'admin' | 'child') => {
    localStorage.setItem('userRole', role);
    setSelectedRole(role);
    router.push(`/${role}`);
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

