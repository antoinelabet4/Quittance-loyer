"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Appartement, Bailleur, Locataire } from '@/lib/types';
import { generateId } from '@/lib/types';

interface AppartementFormProps {
  appartement?: Appartement | null;
  bailleurs: Bailleur[];
  locataires: Locataire[];
  onSave: (appartement: Appartement) => void;
  onCancel: () => void;
}

export function AppartementForm({ appartement, bailleurs, locataires, onSave, onCancel }: AppartementFormProps) {
  const [form, setForm] = useState<Omit<Appartement, 'id'>>({
    adresse: appartement?.adresse || '',
    bailleurId: appartement?.bailleurId || '',
    locataireId: appartement?.locataireId || '',
    loyer: appartement?.loyer || 0,
    charges: appartement?.charges || 0,
    dateEntree: appartement?.dateEntree || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: appartement?.id || generateId(),
      ...form,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse du logement</Label>
        <Input
          id="adresse"
          value={form.adresse}
          onChange={(e) => setForm({ ...form, adresse: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bailleur">Bailleur</Label>
        <Select value={form.bailleurId} onValueChange={(v) => setForm({ ...form, bailleurId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un bailleur" />
          </SelectTrigger>
          <SelectContent>
            {bailleurs.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locataire">Locataire</Label>
        <Select value={form.locataireId} onValueChange={(v) => setForm({ ...form, locataireId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un locataire" />
          </SelectTrigger>
          <SelectContent>
            {locataires.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loyer">Loyer mensuel (€)</Label>
          <Input
            id="loyer"
            type="number"
            step="0.01"
            value={form.loyer}
            onChange={(e) => setForm({ ...form, loyer: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="charges">Charges mensuelles (€)</Label>
          <Input
            id="charges"
            type="number"
            step="0.01"
            value={form.charges}
            onChange={(e) => setForm({ ...form, charges: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateEntree">Date d&apos;entrée dans les lieux</Label>
        <Input
          id="dateEntree"
          type="date"
          value={form.dateEntree}
          onChange={(e) => setForm({ ...form, dateEntree: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={!form.bailleurId || !form.locataireId}>
          {appartement ? 'Modifier' : 'Ajouter'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>
    </form>
  );
}
