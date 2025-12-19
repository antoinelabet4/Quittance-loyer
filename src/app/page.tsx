'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { LandingPage } from '@/components/LandingPage';

function HomeContent() {
  const { user, loading, login } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5fe]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#000091] border-t-transparent rounded-full animate-spin" />
          <div className="text-lg text-slate-600 font-medium">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowAuth(false)}
            className="absolute top-4 left-4 z-10 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Retour
          </button>
          <AuthForm 
            onAuth={login} 
            initialIsLogin={authMode === 'login'} 
          />
        </div>
      );
    }

    return (
      <LandingPage 
        onGetStarted={() => {
          setAuthMode('signup');
          setShowAuth(true);
        }}
        onLogin={() => {
          setAuthMode('login');
          setShowAuth(true);
        }}
      />
    );
  }

  return <Dashboard />;
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
