"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuittancePreview } from './QuittancePreview';
import { AppartementForm } from './AppartementForm';
import type { Quittance, Appartement, Bailleur, Locataire, ModePaiement } from '@/lib/types';
import { MOIS, generateId } from '@/lib/types';
import { FileText, Download, Save, Plus } from 'lucide-react';

interface QuittanceGeneratorProps {
  appartements: Appartement[];
  bailleurs: Bailleur[];
  locataires: Locataire[];
  quittances: Quittance[];
  onSave: (quittance: Quittance) => void;
  getNextQuittanceNumber: (appartementId: string) => number;
  onCreateAppartement: (appartement: Appartement) => void;
  onCreateLocataire: (locataire: Locataire) => void;
}

export function QuittanceGenerator({
  appartements,
  bailleurs,
  locataires,
  quittances,
  onSave,
  getNextQuittanceNumber,
  onCreateAppartement,
  onCreateLocataire,
}: QuittanceGeneratorProps) {
  const currentDate = new Date();
  const [selectedAppartementId, setSelectedAppartementId] = useState<string>('');
  const [selectedLocataireId, setSelectedLocataireId] = useState<string>('');
  const [selectedMois, setSelectedMois] = useState<number>(currentDate.getMonth());
  const [selectedAnnee, setSelectedAnnee] = useState<number>(currentDate.getFullYear());
  const [datePaiement, setDatePaiement] = useState<string>(currentDate.toISOString().split('T')[0]);
  const [lieuEmission, setLieuEmission] = useState<string>('');
  const [modePaiement, setModePaiement] = useState<ModePaiement>('virement');
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateAppartement, setShowCreateAppartement] = useState(false);

  const selectedAppartement = useMemo(() => 
    appartements.find(a => a.id === selectedAppartementId),
    [appartements, selectedAppartementId]
  );

  const selectedBailleur = useMemo(() => 
    selectedAppartement ? bailleurs.find(b => b.id === selectedAppartement.bailleurId) : null,
    [bailleurs, selectedAppartement]
  );

  const selectedLocataire = useMemo(() => 
    locataires.find(l => l.id === selectedLocataireId),
    [locataires, selectedLocataireId]
  );

  const existingQuittance = useMemo(() => 
    quittances.find(q => 
      q.appartementId === selectedAppartementId && 
      q.mois === selectedMois && 
      q.annee === selectedAnnee
    ),
    [quittances, selectedAppartementId, selectedMois, selectedAnnee]
  );

  const years = useMemo(() => {
    const current = currentDate.getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - 2 + i);
  }, []);

  const generateQuittance = (): Quittance | null => {
    if (!selectedAppartement || !selectedBailleur || !selectedLocataire) return null;

    const dateDebut = new Date(selectedAnnee, selectedMois, 1);
    const dateFin = new Date(selectedAnnee, selectedMois + 1, 0);

    let loyer = selectedAppartement.loyer;
    let charges = selectedAppartement.charges;

    if (selectedAppartement.isColocation && selectedAppartement.loyerParLocataire?.[selectedLocataireId]) {
      const montants = selectedAppartement.loyerParLocataire[selectedLocataireId];
      loyer = montants.loyer;
      charges = montants.charges;
    }

    return {
      id: existingQuittance?.id || generateId(),
      numero: existingQuittance?.numero || getNextQuittanceNumber(selectedAppartementId),
      appartementId: selectedAppartementId,
      locataireId: selectedLocataireId,
      mois: selectedMois,
      annee: selectedAnnee,
      dateDebut: dateDebut.toISOString().split('T')[0],
      dateFin: dateFin.toISOString().split('T')[0],
      datePaiement,
      dateEmission: currentDate.toISOString().split('T')[0],
      lieuEmission,
      modePaiement,
      loyer,
      charges,
      total: loyer + charges,
    };
  };

  const quittancePreview = generateQuittance();

  const handleSave = () => {
    if (quittancePreview) {
      onSave(quittancePreview);
      setShowPreview(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateAppartement = (appartement: Appartement) => {
    onCreateAppartement(appartement);
    setSelectedAppartementId(appartement.id);
    if (appartement.locataireIds.length > 0) {
      setSelectedLocataireId(appartement.locataireIds[0]);
    }
    setShowCreateAppartement(false);
  };

  if (showCreateAppartement) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Nouveau logement</h3>
        <AppartementForm
          bailleurs={bailleurs}
          locataires={locataires}
          onSave={handleCreateAppartement}
          onCancel={() => setShowCreateAppartement(false)}
          onCreateLocataire={onCreateLocataire}
        />
      </div>
    );
  }

  if (appartements.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 space-y-4">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Aucun appartement configuré.</p>
        <p className="text-sm">Ajoutez d&apos;abord un bailleur, un locataire et un appartement.</p>
        <Button onClick={() => setShowCreateAppartement(true)} className="mt-4">
          <Plus className="w-4 h-4 mr-2" />
          Créer un logement
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Appartement</Label>
              <div className="flex gap-2">
                <Select value={selectedAppartementId} onValueChange={(id) => {
                  setSelectedAppartementId(id);
                  const appt = appartements.find(a => a.id === id);
                  if (appt && appt.locataireIds.length > 0) {
                    setSelectedLocataireId(appt.locataireIds[0]);
                  }
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner un appartement" />
                  </SelectTrigger>
                  <SelectContent>
                    {appartements.map((a) => {
                      const locataireNames = a.locataireIds
                        .map(id => locataires.find(l => l.id === id)?.nom)
                        .filter(Boolean)
                        .join(', ');
                      return (
                        <SelectItem key={a.id} value={a.id}>
                          {a.adresse} ({locataireNames || 'Sans locataire'})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowCreateAppartement(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Locataire</Label>
              <Select 
                value={selectedLocataireId} 
                onValueChange={setSelectedLocataireId}
                disabled={!selectedAppartement}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un locataire" />
                </SelectTrigger>
                <SelectContent>
                  {selectedAppartement?.locataireIds.map((id) => {
                    const loc = locataires.find(l => l.id === id);
                    return loc ? (
                      <SelectItem key={id} value={id}>{loc.nom}</SelectItem>
                    ) : null;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mois</Label>
                <Select value={selectedMois.toString()} onValueChange={(v) => setSelectedMois(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOIS.map((mois, index) => (
                      <SelectItem key={index} value={index.toString()}>{mois}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Année</Label>
                <Select value={selectedAnnee.toString()} onValueChange={(v) => setSelectedAnnee(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date de paiement</Label>
              <Input
                type="date"
                value={datePaiement}
                onChange={(e) => setDatePaiement(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Lieu d&apos;émission</Label>
              <Input
                value={lieuEmission}
                onChange={(e) => setLieuEmission(e.target.value)}
                placeholder="Paris"
              />
            </div>
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <Select value={modePaiement} onValueChange={(v) => setModePaiement(v as ModePaiement)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virement">Virement bancaire</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="prelevement">Prélèvement automatique</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {existingQuittance && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
              Une quittance existe déjà pour {MOIS[selectedMois]} {selectedAnnee}. 
              Elle sera mise à jour.
            </div>
          )}

          <Button 
            onClick={() => setShowPreview(true)} 
            className="w-full"
            disabled={!selectedAppartementId || !selectedLocataireId || !lieuEmission}
          >
            <FileText className="w-4 h-4 mr-2" />
            Aperçu de la quittance
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4 print:hidden">
            <Button onClick={() => setShowPreview(false)} variant="outline">
              Retour
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
            <Button onClick={handlePrint} variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Imprimer / PDF
            </Button>
          </div>

          {quittancePreview && selectedBailleur && selectedLocataire && selectedAppartement && (
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <QuittancePreview
                quittance={quittancePreview}
                bailleur={selectedBailleur}
                locataire={selectedLocataire}
                appartement={selectedAppartement}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}