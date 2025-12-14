"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { QuittancePreview } from './QuittancePreview';
import { AppartementForm } from './AppartementForm';
import type { Quittance, Appartement, Bailleur, Locataire, ModePaiement } from '@/lib/types';
import { MOIS, generateId } from '@/lib/types';
import { FileText, Download, Save, Plus, Mail, MessageSquare } from 'lucide-react';

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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<'bailleur' | 'locataire' | ''>('');

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
      q.locataireId === selectedLocataireId &&
      q.mois === selectedMois && 
      q.annee === selectedAnnee
    ),
    [quittances, selectedAppartementId, selectedLocataireId, selectedMois, selectedAnnee]
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

  const handleSendEmail = async () => {
    setShowEmailDialog(true);
  };

  const confirmSendEmail = async () => {
    console.log('🟢 [FRONT] confirmSendEmail appelée');
    console.log('🟢 [FRONT] emailRecipient:', emailRecipient);
    console.log('🟢 [FRONT] quittancePreview:', quittancePreview);
    console.log('🟢 [FRONT] selectedBailleur:', selectedBailleur);
    console.log('🟢 [FRONT] selectedLocataire:', selectedLocataire);
    
    if (!emailRecipient || !quittancePreview || !selectedBailleur || !selectedLocataire) {
      console.error('❌ [FRONT] Données manquantes:', { emailRecipient, quittancePreview: !!quittancePreview, bailleur: !!selectedBailleur, locataire: !!selectedLocataire });
      alert('Veuillez sélectionner un destinataire');
      return;
    }

    const recipient = emailRecipient === 'bailleur' ? selectedBailleur : selectedLocataire;
    const recipientEmail = recipient.email;

    console.log('🟢 [FRONT] Recipient:', recipient.nom);
    console.log('🟢 [FRONT] Recipient email:', recipientEmail);

    if (!recipientEmail) {
      console.error('❌ [FRONT] Email manquant pour', emailRecipient);
      alert(`${emailRecipient === 'bailleur' ? 'Le bailleur' : 'Le locataire'} n'a pas d'adresse email`);
      return;
    }
    
    setSendingEmail(true);
    setShowEmailDialog(false);
    
    console.log('🟢 [FRONT] Préparation payload...');
    const payload = {
      type: 'email',
      to: recipientEmail,
      recipient: emailRecipient,
      quittance: quittancePreview,
      bailleur: selectedBailleur,
      locataire: selectedLocataire,
      appartement: selectedAppartement,
    };
    console.log('🟢 [FRONT] Payload:', JSON.stringify(payload, null, 2));
    
    try {
      console.log('🟢 [FRONT] Envoi requête à /api/send-quittance...');
      const response = await fetch('/api/send-quittance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      console.log('🟢 [FRONT] Response status:', response.status);
      console.log('🟢 [FRONT] Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🟢 [FRONT] Response data:', data);
      
      if (response.ok) {
        console.log('✅ [FRONT] Email envoyé avec succès');
        alert(`Quittance envoyée à ${emailRecipient === 'bailleur' ? selectedBailleur.nom : selectedLocataire.nom} (${recipientEmail}) avec succès !`);
      } else {
        console.error('❌ [FRONT] Erreur réponse:', data);
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('❌ [FRONT] Exception:', error);
      console.error('❌ [FRONT] Error stack:', error instanceof Error ? error.stack : 'No stack');
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
      setEmailRecipient('');
      console.log('🟢 [FRONT] Fin de confirmSendEmail');
    }
  };

  const handleSave = () => {
    if (quittancePreview) {
      onSave(quittancePreview);
      setShowPreview(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendSMS = async () => {
    console.log('🟢 [FRONT] handleSendSMS appelée');
    console.log('🟢 [FRONT] selectedLocataire:', selectedLocataire);
    console.log('🟢 [FRONT] telephone:', selectedLocataire?.telephone);
    
    if (!selectedLocataire?.telephone || !quittancePreview || !selectedBailleur) {
      console.error('❌ [FRONT] Données manquantes pour SMS');
      alert('Le locataire doit avoir un numéro de téléphone');
      return;
    }
    
    setSendingSMS(true);
    
    const payload = {
      type: 'sms',
      to: selectedLocataire.telephone,
      quittance: quittancePreview,
      bailleur: selectedBailleur,
      locataire: selectedLocataire,
      appartement: selectedAppartement,
    };
    console.log('🟢 [FRONT] SMS Payload:', JSON.stringify(payload, null, 2));
    
    try {
      console.log('🟢 [FRONT] Envoi SMS...');
      const response = await fetch('/api/send-quittance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      console.log('🟢 [FRONT] SMS Response status:', response.status);
      const data = await response.json();
      console.log('🟢 [FRONT] SMS Response data:', data);
      
      if (response.ok) {
        console.log('✅ [FRONT] SMS envoyé');
        alert('Notification SMS envoyée avec succès !');
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('❌ [FRONT] SMS Exception:', error);
      alert('Erreur lors de l\'envoi du SMS');
    } finally {
      setSendingSMS(false);
      console.log('🟢 [FRONT] Fin handleSendSMS');
    }
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
              Une quittance existe déjà pour ce locataire pour {MOIS[selectedMois]} {selectedAnnee}. 
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
          <div className="flex gap-4 print:hidden flex-wrap">
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
            <Button 
              onClick={handleSendEmail} 
              variant="outline"
              disabled={sendingEmail}
            >
              <Mail className="w-4 h-4 mr-2" />
              {sendingEmail ? 'Envoi...' : 'Envoyer par email'}
            </Button>
            {selectedLocataire?.telephone && (
              <Button 
                onClick={handleSendSMS} 
                variant="outline"
                disabled={sendingSMS}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {sendingSMS ? 'Envoi...' : 'Envoyer par SMS'}
              </Button>
            )}
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

          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Envoyer la quittance par email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-600">À qui souhaitez-vous envoyer la quittance ?</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="recipient"
                      value="locataire"
                      checked={emailRecipient === 'locataire'}
                      onChange={(e) => setEmailRecipient(e.target.value as 'locataire')}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Locataire</p>
                      <p className="text-sm text-gray-600">{selectedLocataire?.nom}</p>
                      <p className="text-xs text-gray-500">{selectedLocataire?.email || 'Pas d\'email'}</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="recipient"
                      value="bailleur"
                      checked={emailRecipient === 'bailleur'}
                      onChange={(e) => setEmailRecipient(e.target.value as 'bailleur')}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Bailleur (copie)</p>
                      <p className="text-sm text-gray-600">{selectedBailleur?.nom}</p>
                      <p className="text-xs text-gray-500">{selectedBailleur?.email || 'Pas d\'email'}</p>
                    </div>
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowEmailDialog(false); setEmailRecipient(''); }}>
                  Annuler
                </Button>
                <Button onClick={confirmSendEmail} disabled={!emailRecipient}>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}