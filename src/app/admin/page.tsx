'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  nom: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-lg text-slate-200">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Administration
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            ← Retour
          </button>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-2xl font-semibold text-white">
              Liste des utilisateurs
            </h2>
            <p className="text-slate-400 mt-1">
              {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
            </p>
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center text-slate-400">
              Chargement des utilisateurs...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Aucun utilisateur enregistré
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u, index) => (
                    <tr
                      key={u.id}
                      className={`${
                        index % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/50'
                      } hover:bg-slate-800/40 transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                        {u.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200 font-medium">
                        {u.nom || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {u.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
