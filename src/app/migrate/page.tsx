'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MigratePage() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMigrate = async () => {
    if (!user) {
      setStatus('❌ Vous devez être connecté');
      return;
    }

    setLoading(true);
    setStatus('📤 Récupération des données du localStorage...');

    try {
      const bailleurs = JSON.parse(localStorage.getItem('bailleurs') || '[]');
      const locataires = JSON.parse(localStorage.getItem('locataires') || '[]');
      const appartements = JSON.parse(localStorage.getItem('appartements') || '[]');
      const quittances = JSON.parse(localStorage.getItem('quittances') || '[]');

      setStatus(`📊 Données trouvées: ${bailleurs.length} bailleurs, ${locataires.length} locataires, ${appartements.length} appartements, ${quittances.length} quittances`);

      const response = await fetch('/api/migrate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bailleurs,
          locataires,
          appartements,
          quittances
        })
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`✅ Migration réussie!\n\n` +
          `Bailleurs: ${result.results.bailleurs}\n` +
          `Locataires: ${result.results.locataires}\n` +
          `Appartements: ${result.results.appartements}\n` +
          `Quittances: ${result.results.quittances}\n\n` +
          (result.results.errors.length > 0 ? `Erreurs: ${result.results.errors.join('\n')}` : ''));
      } else {
        setStatus(`❌ Erreur: ${result.error}`);
      }
    } catch (error: any) {
      setStatus(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.email !== 'antoinelabet@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>Cette page est réservée à l&apos;administrateur.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Migration des données localStorage → Supabase</CardTitle>
          <CardDescription>
            Cette page permet de transférer toutes vos données du localStorage vers Supabase pour le compte {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleMigrate} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? '⏳ Migration en cours...' : '🚀 Lancer la migration'}
          </Button>

          {status && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{status}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
