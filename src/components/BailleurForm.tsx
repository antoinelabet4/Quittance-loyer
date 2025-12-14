"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Bailleur } from '@/lib/types';

interface BailleurFormProps {
  bailleur: Bailleur | null;
  onSave: (bailleur: Bailleur) => void;
  onCancel: () => void;
}

export function BailleurForm({ bailleur, onSave, onCancel }: BailleurFormProps) {
  const { user } = useAuth();
  const [nom, setNom] = useState(bailleur?.nom || '');
  const [adresse, setAdresse] = useState(bailleur?.adresse || '');
  const [type, setType] = useState<'personne_physique' | 'societe'>(bailleur?.type || 'personne_physique');
  const [siret, setSiret] = useState(bailleur?.siret || '');
  const [email, setEmail] = useState(bailleur?.email || user?.email || '');
  const [telephone, setTelephone] = useState(bailleur?.telephone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: bailleur?.id || '',
      nom,
      adresse,
      type,
      siret: type === 'societe' ? siret : undefined,
      email,
      telephone,
      userId: user?.id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type de bailleur</Label>
        <Select value={type} onValueChange={(v) => setType(v as 'personne_physique' | 'societe')}>
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
        <Label htmlFor="nom">{type === 'societe' ? 'Dénomination sociale' : 'Nom et prénom'}</Label>
        <Input
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">{type === 'societe' ? 'Siège social' : 'Adresse du domicile'}</Label>
        <Input
          id="adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          required
        />
      </div>

      {type === 'societe' && (
        <div className="space-y-2">
          <Label htmlFor="siret">Numéro SIRET</Label>
          <Input
            id="siret"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email (optionnel)</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone (optionnel)</Label>
        <Input
          id="telephone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
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
