"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Appartement, Bailleur, Locataire } from '@/lib/types';
import { generateId } from '@/lib/types';
import { Plus, X } from 'lucide-react';
import { LocataireForm } from './LocataireForm';

interface AppartementFormProps {
  appartement?: Appartement | null;
  bailleurs: Bailleur[];
  locataires: Locataire[];
  onSave: (appartement: Appartement) => void;
  onCancel: () => void;
  onCreateLocataire: (locataire: Locataire) => void;
}

export function AppartementForm({ appartement, bailleurs, locataires, onSave, onCancel, onCreateLocataire }: AppartementFormProps) {
  const [form, setForm] = useState<Omit<Appartement, 'id'>>({
    adresse: appartement?.adresse || '',
    bailleurId: appartement?.bailleurId || '',
    locataireIds: appartement?.locataireIds || [],
    loyer: appartement?.loyer || 0,
    charges: appartement?.charges || 0,
    dateEntree: appartement?.dateEntree || new Date().toISOString().split('T')[0],
  });
  const [showCreateLocataire, setShowCreateLocataire] = useState(false);
  const [selectedLocataireId, setSelectedLocataireId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: appartement?.id || generateId(),
      ...form,
    });
  };

  const handleAddLocataire = () => {
    if (selectedLocataireId && !form.locataireIds.includes(selectedLocataireId)) {
      setForm({ ...form, locataireIds: [...form.locataireIds, selectedLocataireId] });
      setSelectedLocataireId('');
    }
  };

  const handleRemoveLocataire = (id: string) => {
    setForm({ ...form, locataireIds: form.locataireIds.filter(l => l !== id) });
  };

  const handleCreateLocataire = (locataire: Locataire) => {
    onCreateLocataire(locataire);
    setForm({ ...form, locataireIds: [...form.locataireIds, locataire.id] });
    setShowCreateLocataire(false);
  };

  if (showCreateLocataire) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Nouveau locataire</h3>
        <LocataireForm
          onSave={handleCreateLocataire}
          onCancel={() => setShowCreateLocataire(false)}
        />
      </div>
    );
  }

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
        <Label>Locataires</Label>
        <div className="flex gap-2">
          <Select value={selectedLocataireId} onValueChange={setSelectedLocataireId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Sélectionner un locataire" />
            </SelectTrigger>
            <SelectContent>
              {locataires.filter(l => !form.locataireIds.includes(l.id)).map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" size="sm" onClick={handleAddLocataire} disabled={!selectedLocataireId}>
            Ajouter
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setShowCreateLocataire(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {form.locataireIds.length > 0 && (
          <div className="space-y-2 mt-3">
            {form.locataireIds.map((id) => {
              const locataire = locataires.find(l => l.id === id);
              return locataire ? (
                <div key={id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{locataire.nom}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveLocataire(id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : null;
            })}
          </div>
        )}
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
        <Button type="submit" className="flex-1" disabled={!form.bailleurId || form.locataireIds.length === 0}>
          {appartement ? 'Modifier' : 'Ajouter'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>
    </form>
  );
}