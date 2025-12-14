"use client";

import { useState } from 'react';
import type { Quittance, Bailleur, Locataire, Appartement } from '@/lib/types';
import { MOIS, numberToWords, formatDate, formatMoney } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface QuittancePreviewProps {
  quittance: Quittance;
  bailleur: Bailleur;
  locataire: Locataire;
  appartement: Appartement;
}

export function QuittancePreview({ quittance, bailleur, locataire, appartement }: QuittancePreviewProps) {
  const [signature, setSignature] = useState<string | null>(null);
  
  const totalEnLettres = numberToWords(Math.floor(quittance.total));
  const centimes = Math.round((quittance.total % 1) * 100);
  const totalLettresComplet = centimes > 0 
    ? `${totalEnLettres} euros et ${numberToWords(centimes)} centimes`
    : `${totalEnLettres} euros`;

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignature(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    setSignature(null);
  };

  return (
    <div className="space-y-4">
      <div className="print:hidden bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Signature du bailleur</h3>
            {signature ? (
              <div className="flex items-center gap-3">
                <div className="w-32 h-20 border border-gray-300 rounded overflow-hidden bg-gray-50">
                  <img src={signature} alt="Signature" className="w-full h-full object-contain" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeSignature}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Retirer
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label htmlFor="signature-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#000091] text-white rounded-md hover:bg-[#000091]/90 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Télécharger signature</span>
                  </div>
                  <input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-500">Format: JPG, PNG (max 5MB)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="quittance-pdf" className="bg-white text-[#1a1a2e] p-8 w-full mx-auto font-serif text-sm leading-relaxed">
        <p className="italic text-center mb-6 text-xs leading-5">
          La présente quittance de loyer est établie conformément aux dispositions des articles 21 et 21-2 de la loi n°89-462 du 6 juillet 1989, tendant à améliorer les rapports locatifs, ainsi qu&apos;aux articles 1714 et suivants du Code civil relatifs aux baux d&apos;habitation. Elle atteste du paiement intégral du loyer et des charges pour la période indiquée, et décharge le locataire de toute obligation de ce chef pour ladite période.
        </p>

        <div className="border-2 border-[#1a1a2e] p-4 text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide">
            Quittance De Loyer N° : {quittance.numero}
          </h1>
        </div>

        <section className="mb-6">
          <h2 className="font-bold text-lg mb-3 border-b border-[#1a1a2e] pb-1">Bailleur :</h2>
          <div className="bg-[#e8e8f0] px-4 py-2 mb-1">
            <span className="font-semibold">Nom et prénom ou Dénomination sociale : </span>
            {bailleur.nom}
          </div>
          <div className="bg-[#e8e8f0] px-4 py-2">
            <span className="font-semibold">Adresse du domicile ou Siège social : </span>
            {bailleur.adresse}
          </div>
          {bailleur.siret && (
            <div className="bg-[#e8e8f0] px-4 py-2 mt-1">
              <span className="font-semibold">SIRET : </span>
              {bailleur.siret}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="font-bold text-lg mb-3 border-b border-[#1a1a2e] pb-1">Locataire :</h2>
          <div className="bg-[#e8e8f0] px-4 py-2 mb-1">
            <span className="font-semibold">Nom et prénom ou Dénomination sociale : </span>
            {locataire.nom}
          </div>
          <div className="bg-[#e8e8f0] px-4 py-2">
            <span className="font-semibold">Adresse du domicile ou Siège social : </span>
            {locataire.adresse}
          </div>
        </section>

        <div className="bg-[#e8e8f0] px-4 py-2 mb-6">
          <span className="font-semibold">Date : </span>
          {formatDate(quittance.datePaiement)}
        </div>

        <section className="mb-6">
          <h3 className="font-bold mb-2">Période concernée :</h3>
          <div className="mb-1">
            <span className="font-semibold">Du : </span>
            {formatDate(quittance.dateDebut)}
          </div>
          <div className="border-b border-[#1a1a2e] pb-2">
            <span className="font-semibold">Au : </span>
            {formatDate(quittance.dateFin)}
          </div>
        </section>

        <p className="mb-6">
          Je soussigné(e), <span className="font-semibold">{bailleur.nom}</span>, propriétaire du logement situé au <span className="font-semibold">{appartement.adresse}</span>, reconnais avoir reçu de <span className="font-semibold">{locataire.nom}</span> la somme totale de <span className="font-semibold">{formatMoney(quittance.total)}</span> (en lettres <span className="font-semibold">{totalLettresComplet}</span>), correspondant au paiement du loyer et des charges pour la période indiquée ci-dessus.
        </p>

        <section className="mb-6">
          <h3 className="font-bold text-lg mb-3">Détail du paiement :</h3>
          <div className="bg-[#e8e8f0] px-4 py-2 mb-1">
            <span className="font-semibold">Loyer : </span>
            {formatMoney(quittance.loyer)}
          </div>
          <div className="bg-[#e8e8f0] px-4 py-2 mb-1">
            <span className="font-semibold">Provision pour charges : </span>
            {formatMoney(quittance.charges)}
          </div>
          <div className="bg-[#e8e8f0] px-4 py-2 border-b-2 border-[#1a1a2e]">
            <span className="font-semibold">Total payé : </span>
            {formatMoney(quittance.total)}
          </div>
        </section>

        <p className="mb-6 border-y border-[#1a1a2e] py-4">
          Le locataire est, par la présente, quitte et libéré de tout paiement au titre du loyer et des charges pour la période mentionnée.
        </p>

        <section className="mb-6">
          <h3 className="font-bold mb-3">Mode de paiement :</h3>
          <div className="flex flex-col gap-1">
            {(['virement', 'cheque', 'especes', 'prelevement', 'autre'] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-2">
                <div className={`w-4 h-4 border border-[#1a1a2e] ${quittance.modePaiement === mode ? 'bg-[#1a1a2e]' : ''}`} />
                <span>
                  {mode === 'virement' && 'Virement bancaire'}
                  {mode === 'cheque' && 'Chèque'}
                  {mode === 'especes' && 'Espèces'}
                  {mode === 'prelevement' && 'Prélèvement automatique'}
                  {mode === 'autre' && 'Autre'}
                </span>
              </label>
            ))}
          </div>
        </section>

        <div className="border-t border-[#1a1a2e] pt-4 mb-8">
          <p className="font-semibold">
            Fait à : <span className="border-b border-[#1a1a2e] px-2">{quittance.lieuEmission}</span>
            {' '}le : <span className="border-b border-[#1a1a2e] px-2">{formatDate(quittance.dateEmission)}</span>
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div className="border border-[#1a1a2e] p-4 w-64 h-32 relative">
            {signature ? (
              <img src={signature} alt="Signature du bailleur" className="w-full h-full object-contain" />
            ) : (
              <p className="italic text-gray-600">Signature du bailleur :</p>
            )}
          </div>
          <div className="relative">
            <div className="border-4 border-[#0055a4] px-6 py-4 transform rotate-[-15deg] text-[#0055a4] font-bold text-2xl">
              PAYÉ
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-8 text-center">
          Quittance de loyer - {MOIS[quittance.mois]} {quittance.annee}
        </p>
      </div>
    </div>
  );
}