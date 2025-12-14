"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuittancePreview } from './QuittancePreview';
import type { Quittance, Appartement, Bailleur, Locataire, ModePaiement } from '@/lib/types';
import { MOIS, generateId } from '@/lib/types';
import { FileText, Download, Save } from 'lucide-react';

interface QuittanceGeneratorProps {
  appartements: Appartement[];
  bailleurs: Bailleur[];
  locataires: Locataire[];
  quittances: Quittance[];
  onSave: (quittance: Quittance) => void;
  getNextQuittanceNumber: (appartementId: string) => number;
}

export function QuittanceGenerator({
  appartements,
  bailleurs,
  locataires,
  quittances,
  onSave,
  getNextQuittanceNumber,
}: QuittanceGeneratorProps) {
  const currentDate = new Date();
  const [selectedAppartementId, setSelectedAppartementId] = useState<string>('');
  const [selectedMois, setSelectedMois] = useState<number>(currentDate.getMonth());
  const [selectedAnnee, setSelectedAnnee] = useState<number>(currentDate.getFullYear());
  const [datePaiement, setDatePaiement] = useState<string>(currentDate.toISOString().split('T')[0]);
  const [lieuEmission, setLieuEmission] = useState<string>('');
  const [modePaiement, setModePaiement] = useState<ModePaiement>('virement');
  const [showPreview, setShowPreview] = useState(false);

  const selectedAppartement = useMemo(() => 
    appartements.find(a => a.id === selectedAppartementId),
    [appartements, selectedAppartementId]
  );

  const selectedBailleur = useMemo(() => 
    selectedAppartement ? bailleurs.find(b => b.id === selectedAppartement.bailleurId) : null,
    [bailleurs, selectedAppartement]
  );

  const selectedLocataire = useMemo(() => 
    selectedAppartement ? locataires.find(l => l.id === selectedAppartement.locataireId) : null,
    [locataires, selectedAppartement]
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

    return {
      id: existingQuittance?.id || generateId(),
      numero: existingQuittance?.numero || getNextQuittanceNumber(selectedAppartementId),
      appartementId: selectedAppartementId,
      mois: selectedMois,
      annee: selectedAnnee,
      dateDebut: dateDebut.toISOString().split('T')[0],
      dateFin: dateFin.toISOString().split('T')[0],
      datePaiement,
      dateEmission: currentDate.toISOString().split('T')[0],
      lieuEmission,
      modePaiement,
      loyer: selectedAppartement.loyer,
      charges: selectedAppartement.charges,
      total: selectedAppartement.loyer + selectedAppartement.charges,
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

  if (appartements.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Aucun appartement configuré.</p>
        <p className="text-sm">Ajoutez d&apos;abord un bailleur, un locataire et un appartement.</p>
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
              <Select value={selectedAppartementId} onValueChange={setSelectedAppartementId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un appartement" />
                </SelectTrigger>
                <SelectContent>
                  {appartements.map((a) => {
                    const locataire = locataires.find(l => l.id === a.locataireId);
                    return (
                      <SelectItem key={a.id} value={a.id}>
                        {a.adresse} ({locataire?.nom || 'Sans locataire'})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Date de paiement</Label>
              <Input
                type="date"
                value={datePaiement}
                onChange={(e) => setDatePaiement(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Lieu d&apos;émission</Label>
              <Input
                value={lieuEmission}
                onChange={(e) => setLieuEmission(e.target.value)}
                placeholder="Paris"
              />
            </div>
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

          {existingQuittance && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
              Une quittance existe déjà pour {MOIS[selectedMois]} {selectedAnnee}. 
              Elle sera mise à jour.
            </div>
          )}

          <Button 
            onClick={() => setShowPreview(true)} 
            className="w-full"
            disabled={!selectedAppartementId || !lieuEmission}
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
