"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Appartement, Bailleur, Locataire, AppartementLocataire } from '@/lib/types';
import { generateId } from '@/lib/types';
import { Plus, X, UserPlus } from 'lucide-react';
import { LocataireForm } from './LocataireForm';

interface AppartementFormProps {
  appartement?: Appartement | null;
  bailleurs: Bailleur[];
  locataires: Locataire[];
  onSave: (appartement: Appartement) => void;
  onCancel: () => void;
  onCreateLocataire: (locataire: Locataire) => void;
  appartementLocataires?: AppartementLocataire[];
  onSaveAppartementLocataire?: (rel: AppartementLocataire) => void;
}

export function AppartementForm({ 
  appartement, 
  bailleurs, 
  locataires, 
  onSave, 
  onCancel, 
  onCreateLocataire,
  appartementLocataires = [],
  onSaveAppartementLocataire
}: AppartementFormProps) {
  const [form, setForm] = useState<Omit<Appartement, 'id'>>({
    adresse: appartement?.adresse || '',
    bailleurId: appartement?.bailleurId || '',
    locataireIds: appartement?.locataireIds || [],
    isColocation: appartement?.isColocation || false,
    loyer: appartement?.loyer || 0,
    charges: appartement?.charges || 0,
    loyerParLocataire: appartement?.loyerParLocataire || {},
    dateEntree: appartement?.dateEntree || new Date().toISOString().split('T')[0],
  });
  const [showCreateLocataire, setShowCreateLocataire] = useState(false);
  const [selectedLocataireId, setSelectedLocataireId] = useState<string>('');
  const [showAddLocataireDialog, setShowAddLocataireDialog] = useState(false);
  const [newLocataireRel, setNewLocataireRel] = useState({
    locataireId: '',
    dateEntree: new Date().toISOString().split('T')[0],
    loyer: 0,
    charges: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: appartement?.id || generateId(),
      ...form,
    });
  };

  const handleAddLocataire = () => {
    if (selectedLocataireId && !form.locataireIds.includes(selectedLocataireId)) {
      const newLocataireIds = [...form.locataireIds, selectedLocataireId];
      const newForm = { ...form, locataireIds: newLocataireIds };
      
      if (form.isColocation) {
        newForm.loyerParLocataire = {
          ...form.loyerParLocataire,
          [selectedLocataireId]: { loyer: 0, charges: 0 }
        };
      }
      
      setForm(newForm);
      setSelectedLocataireId('');
    }
  };

  const handleRemoveLocataire = (id: string) => {
    const newLocataireIds = form.locataireIds.filter(l => l !== id);
    const newLoyerParLocataire = { ...form.loyerParLocataire };
    delete newLoyerParLocataire[id];
    
    setForm({ 
      ...form, 
      locataireIds: newLocataireIds,
      loyerParLocataire: newLoyerParLocataire
    });
  };

  const handleCreateLocataire = (locataire: Locataire) => {
    onCreateLocataire(locataire);
    const newLocataireIds = [...form.locataireIds, locataire.id];
    const newForm = { ...form, locataireIds: newLocataireIds };
    
    if (form.isColocation) {
      newForm.loyerParLocataire = {
        ...form.loyerParLocataire,
        [locataire.id]: { loyer: 0, charges: 0 }
      };
    }
    
    setForm(newForm);
    setShowCreateLocataire(false);
  };

  const handleColocationChange = (checked: boolean) => {
    const newForm = { ...form, isColocation: checked };
    
    if (checked) {
      const newLoyerParLocataire: { [key: string]: { loyer: number; charges: number } } = {};
      form.locataireIds.forEach(id => {
        newLoyerParLocataire[id] = { loyer: 0, charges: 0 };
      });
      newForm.loyerParLocataire = newLoyerParLocataire;
    }
    
    setForm(newForm);
  };

  const updateLoyerParLocataire = (locataireId: string, field: 'loyer' | 'charges', value: number) => {
    setForm({
      ...form,
      loyerParLocataire: {
        ...form.loyerParLocataire,
        [locataireId]: {
          ...form.loyerParLocataire![locataireId],
          [field]: value
        }
      }
    });
  };

  const handleAddLocataireToExistingAppartement = () => {
    if (appartement?.id && newLocataireRel.locataireId && onSaveAppartementLocataire) {
      const rel: AppartementLocataire = {
        id: generateId(),
        appartementId: appartement.id,
        locataireId: newLocataireRel.locataireId,
        dateEntree: newLocataireRel.dateEntree,
        loyer: form.isColocation ? newLocataireRel.loyer : undefined,
        charges: form.isColocation ? newLocataireRel.charges : undefined
      };
      
      onSaveAppartementLocataire(rel);
      
      const newLocataireIds = [...form.locataireIds, newLocataireRel.locataireId];
      const newForm = { ...form, locataireIds: newLocataireIds };
      
      if (form.isColocation) {
        newForm.loyerParLocataire = {
          ...form.loyerParLocataire,
          [newLocataireRel.locataireId]: { loyer: newLocataireRel.loyer, charges: newLocataireRel.charges }
        };
      }
      
      setForm(newForm);
      setShowAddLocataireDialog(false);
      setNewLocataireRel({
        locataireId: '',
        dateEntree: new Date().toISOString().split('T')[0],
        loyer: 0,
        charges: 0
      });
    }
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

  if (showAddLocataireDialog && appartement) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Ajouter un locataire au logement</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Locataire</Label>
            <Select value={newLocataireRel.locataireId} onValueChange={(v) => setNewLocataireRel({...newLocataireRel, locataireId: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un locataire" />
              </SelectTrigger>
              <SelectContent>
                {locataires.filter(l => !form.locataireIds.includes(l.id)).map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date d&apos;entrée</Label>
            <Input
              type="date"
              value={newLocataireRel.dateEntree}
              onChange={(e) => setNewLocataireRel({...newLocataireRel, dateEntree: e.target.value})}
              required
            />
          </div>

          {form.isColocation && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loyer (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newLocataireRel.loyer}
                  onChange={(e) => setNewLocataireRel({...newLocataireRel, loyer: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Charges (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newLocataireRel.charges}
                  onChange={(e) => setNewLocataireRel({...newLocataireRel, charges: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={handleAddLocataireToExistingAppartement} className="flex-1" disabled={!newLocataireRel.locataireId}>
              Ajouter
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddLocataireDialog(false)} className="flex-1">
              Annuler
            </Button>
          </div>
        </div>
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
        <div className="flex items-center justify-between">
          <Label>Locataires (optionnel)</Label>
          {appartement && (
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={() => setShowAddLocataireDialog(true)}
              className="text-xs"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Ajouter avec date
            </Button>
          )}
        </div>
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
              const rel = appartementLocataires.find(r => r.appartementId === appartement?.id && r.locataireId === id);
              return locataire ? (
                <div key={id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{locataire.nom}</span>
                    {rel && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Entrée: {new Date(rel.dateEntree).toLocaleDateString('fr-FR')})
                      </span>
                    )}
                  </div>
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

      <div className="flex items-center space-x-2 py-2">
        <Checkbox 
          id="colocation" 
          checked={form.isColocation}
          onCheckedChange={handleColocationChange}
          disabled={form.locataireIds.length === 0}
        />
        <Label htmlFor="colocation" className="cursor-pointer">
          Colocation (loyer par locataire)
        </Label>
      </div>

      {!form.isColocation ? (
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
      ) : (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Loyer et charges par locataire</Label>
          {form.locataireIds.map((id) => {
            const locataire = locataires.find(l => l.id === id);
            const montants = form.loyerParLocataire?.[id] || { loyer: 0, charges: 0 };
            return locataire ? (
              <div key={id} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="font-medium text-sm">{locataire.nom}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`loyer-${id}`} className="text-xs">Loyer (€)</Label>
                    <Input
                      id={`loyer-${id}`}
                      type="number"
                      step="0.01"
                      value={montants.loyer}
                      onChange={(e) => updateLoyerParLocataire(id, 'loyer', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`charges-${id}`} className="text-xs">Charges (€)</Label>
                    <Input
                      id={`charges-${id}`}
                      type="number"
                      step="0.01"
                      value={montants.charges}
                      onChange={(e) => updateLoyerParLocataire(id, 'charges', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

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
        <Button type="submit" className="flex-1" disabled={!form.bailleurId}>
          {appartement ? 'Modifier' : 'Ajouter'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>
    </form>
  );
}