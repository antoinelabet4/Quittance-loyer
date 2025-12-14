"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QuittancePreview } from './QuittancePreview';
import type { Quittance, Appartement, Bailleur, Locataire } from '@/lib/types';
import { MOIS, formatMoney } from '@/lib/types';
import { FileText, Trash2, Eye, Calendar, Home, Download } from 'lucide-react';
import { generateQuittancePDF } from '@/lib/pdf-generator';

interface QuittanceArchiveProps {
  quittances: Quittance[];
  appartements: Appartement[];
  bailleurs: Bailleur[];
  locataires: Locataire[];
  onDelete: (id: string) => void;
}

export function QuittanceArchive({
  quittances,
  appartements,
  bailleurs,
  locataires,
  onDelete,
}: QuittanceArchiveProps) {
  const [filterAppartement, setFilterAppartement] = useState<string>('all');
  const [filterAnnee, setFilterAnnee] = useState<string>('all');
  const [viewingQuittance, setViewingQuittance] = useState<Quittance | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const years = useMemo(() => {
    const allYears = [...new Set(quittances.map(q => q.annee))];
    return allYears.sort((a, b) => b - a);
  }, [quittances]);

  const filteredQuittances = useMemo(() => {
    return quittances
      .filter(q => filterAppartement === 'all' || q.appartementId === filterAppartement)
      .filter(q => filterAnnee === 'all' || q.annee.toString() === filterAnnee)
      .sort((a, b) => {
        if (a.annee !== b.annee) return b.annee - a.annee;
        return b.mois - a.mois;
      });
  }, [quittances, filterAppartement, filterAnnee]);

  const getQuittanceDetails = (quittance: Quittance) => {
    const appartement = appartements.find(a => a.id === quittance.appartementId);
    const bailleur = appartement ? bailleurs.find(b => b.id === appartement.bailleurId) : null;
    const locataire = locataires.find(l => l.id === quittance.locataireId);
    return { appartement, bailleur, locataire };
  };

  const handleDownloadPDF = async (quittance: Quittance) => {
    const { appartement, bailleur, locataire } = getQuittanceDetails(quittance);
    if (!appartement || !bailleur || !locataire) return;

    setDownloading(quittance.id);
    
    try {
      const signatureKey = `signature_${bailleur.id}`;
      const signature = localStorage.getItem(signatureKey);
      
      await generateQuittancePDF(
        quittance,
        bailleur,
        locataire,
        appartement,
        signature
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setDownloading(null);
    }
  };

  if (viewingQuittance) {
    const { appartement, bailleur, locataire } = getQuittanceDetails(viewingQuittance);
    
    if (appartement && bailleur && locataire) {
      return (
        <div className="space-y-6">
          <div className="flex gap-4 print:hidden">
            <Button onClick={() => setViewingQuittance(null)} variant="outline">
              Retour à l&apos;archive
            </Button>
            <Button 
              onClick={() => handleDownloadPDF(viewingQuittance)} 
              variant="secondary" 
              className="ml-auto"
              disabled={downloading === viewingQuittance.id}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading === viewingQuittance.id ? 'Génération...' : 'Télécharger PDF'}
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <QuittancePreview
              quittance={viewingQuittance}
              bailleur={bailleur}
              locataire={locataire}
              appartement={appartement}
            />
          </div>
        </div>
      );
    }
  }

  if (quittances.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Aucune quittance archivée.</p>
        <p className="text-sm">Les quittances sauvegardées apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Appartement
          </Label>
          <Select value={filterAppartement} onValueChange={setFilterAppartement}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les appartements</SelectItem>
              {appartements.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.adresse}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Année
          </Label>
          <Select value={filterAnnee} onValueChange={setFilterAnnee}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les années</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredQuittances.map((quittance) => {
          const { appartement, locataire } = getQuittanceDetails(quittance);
          
          return (
            <div
              key={quittance.id}
              className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#000091]" />
                  <span className="font-semibold">
                    Quittance N°{quittance.numero}
                  </span>
                  <span className="text-gray-500">-</span>
                  <span className="text-[#000091] font-medium">
                    {MOIS[quittance.mois]} {quittance.annee}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {appartement?.adresse} • {locataire?.nom}
                </div>
                <div className="text-sm font-medium text-gray-800 mt-1">
                  {formatMoney(quittance.total)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingQuittance(quittance)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadPDF(quittance)}
                  disabled={downloading === quittance.id}
                  className="text-green-600 hover:bg-green-50"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(quittance.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-gray-500">
        {filteredQuittances.length} quittance(s) trouvée(s)
      </div>
    </div>
  );
}