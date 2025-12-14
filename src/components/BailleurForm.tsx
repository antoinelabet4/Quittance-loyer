"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Bailleur } from '@/lib/types';
import { generateId } from '@/lib/types';

interface BailleurFormProps {
  bailleur?: Bailleur | null;
  onSave: (bailleur: Bailleur) => void;
  onCancel: () => void;
}

export function BailleurForm({ bailleur, onSave, onCancel }: BailleurFormProps) {
  const [form, setForm] = useState<Omit<Bailleur, 'id'>>({
    nom: bailleur?.nom || '',
    adresse: bailleur?.adresse || '',
    type: bailleur?.type || 'personne_physique',
    siret: bailleur?.siret || '',
    email: bailleur?.email || '',
    telephone: bailleur?.telephone || '',
    userId: bailleur?.userId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: bailleur?.id || generateId(),
      ...form,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type de bailleur</Label>
        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'personne_physique' | 'societe' })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personne_physique">Personne physique</SelectItem>
            <SelectItem value="societe">Société</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nom">{form.type === 'societe' ? 'Dénomination sociale' : 'Nom et prénom'}</Label>
        <Input
          id="nom"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">{form.type === 'societe' ? 'Siège social' : 'Adresse du domicile'}</Label>
        <Input
          id="adresse"
          value={form.adresse}
          onChange={(e) => setForm({ ...form, adresse: e.target.value })}
          required
        />
      </div>

      {form.type === 'societe' && (
        <div className="space-y-2">
          <Label htmlFor="siret">Numéro SIRET</Label>
          <Input
            id="siret"
            value={form.siret}
            onChange={(e) => setForm({ ...form, siret: e.target.value })}
          />
        </div>
      )}

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
          {bailleur ? 'Modifier' : 'Ajouter'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>
    </form>
  );
}