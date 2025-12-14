'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';

function HomeContent() {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuth={login} />;
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