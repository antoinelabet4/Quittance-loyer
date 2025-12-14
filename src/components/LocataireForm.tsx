"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Locataire } from '@/lib/types';
import { generateId } from '@/lib/types';

interface LocataireFormProps {
  locataire?: Locataire | null;
  onSave: (locataire: Locataire) => void;
  onCancel: () => void;
}

export function LocataireForm({ locataire, onSave, onCancel }: LocataireFormProps) {
  const [form, setForm] = useState<Omit<Locataire, 'id'>>({
    nom: locataire?.nom || '',
    adresse: locataire?.adresse || '',
    email: locataire?.email || '',
    telephone: locataire?.telephone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: locataire?.id || generateId(),
      ...form,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom et prénom (ou dénomination sociale)</Label>
        <Input
          id="nom"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse du domicile (ou siège social)</Label>
        <Input
          id="adresse"
          value={form.adresse}
          onChange={(e) => setForm({ ...form, adresse: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (optionnel)</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone (optionnel)</Label>
        <Input
          id="telephone"
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {locataire ? 'Modifier' : 'Ajouter'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>
    </form>
  );
}
