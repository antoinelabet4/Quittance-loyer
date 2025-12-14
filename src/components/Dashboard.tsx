"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { BailleurForm } from './BailleurForm';
import { LocataireForm } from './LocataireForm';
import { AppartementForm } from './AppartementForm';
import { QuittanceGenerator } from './QuittanceGenerator';
import { QuittanceArchive } from './QuittanceArchive';
import type { Bailleur, Locataire, Appartement, Quittance } from '@/lib/types';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Building2, 
  Users, 
  Home, 
  FileText, 
  Archive,
  User
} from 'lucide-react';

export function Dashboard() {
  const {
    isLoaded,
    bailleurs,
    locataires,
    appartements,
    quittances,
    activeBailleurId,
    setActiveBailleur,
    addBailleur,
    updateBailleur,
    deleteBailleur,
    addLocataire,
    updateLocataire,
    deleteLocataire,
    addAppartement,
    updateAppartement,
    deleteAppartement,
    addQuittance,
    updateQuittance,
    deleteQuittance,
    getNextQuittanceNumber,
  } = useLocalStorage();

  const [editingBailleur, setEditingBailleur] = useState<Bailleur | null>(null);
  const [editingLocataire, setEditingLocataire] = useState<Locataire | null>(null);
  const [editingAppartement, setEditingAppartement] = useState<Appartement | null>(null);
  const [showBailleurForm, setShowBailleurForm] = useState(false);
  const [showLocataireForm, setShowLocataireForm] = useState(false);
  const [showAppartementForm, setShowAppartementForm] = useState(false);

  const activeBailleur = bailleurs.find(b => b.id === activeBailleurId);
  const filteredAppartements = appartements.filter(a => a.bailleurId === activeBailleurId);
  const filteredQuittances = quittances.filter(q => {
    const appt = appartements.find(a => a.id === q.appartementId);
    return appt?.bailleurId === activeBailleurId;
  });

  const handleSaveBailleur = (bailleur: Bailleur) => {
    if (editingBailleur) {
      updateBailleur(bailleur);
    } else {
      addBailleur(bailleur);
    }
    setShowBailleurForm(false);
    setEditingBailleur(null);
  };

  const handleSaveLocataire = (locataire: Locataire) => {
    if (editingLocataire) {
      updateLocataire(locataire);
    } else {
      addLocataire(locataire);
    }
    setShowLocataireForm(false);
    setEditingLocataire(null);
  };

  const handleSaveAppartement = (appartement: Appartement) => {
    if (editingAppartement) {
      updateAppartement(appartement);
    } else {
      addAppartement(appartement);
    }
    setShowAppartementForm(false);
    setEditingAppartement(null);
  };

  const handleSaveQuittance = (quittance: Quittance) => {
    const existing = quittances.find(q => q.id === quittance.id);
    if (existing) {
      updateQuittance(quittance);
    } else {
      addQuittance(quittance);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5fe]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#000091] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5fe] print:bg-white">
      <header className="bg-[#000091] text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#000091]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Quittances de Loyer</h1>
                  <p className="text-xs text-blue-200">Générateur officiel</p>
                </div>
              </div>
            </div>
            
            {bailleurs.length > 0 && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <Select value={activeBailleurId || ''} onValueChange={setActiveBailleur}>
                  <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sélectionner un bailleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {bailleurs.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        <div className="h-2 bg-[#e1000f]" />
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        {bailleurs.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Bienvenue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">
                Commencez par créer votre premier profil de bailleur pour générer des quittances de loyer.
              </p>
              <Button 
                onClick={() => setShowBailleurForm(true)} 
                className="w-full bg-[#000091] hover:bg-[#000091]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer mon profil bailleur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="quittances" className="space-y-6 print:hidden">
            <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
              <TabsTrigger value="quittances" className="flex items-center gap-2 data-[state=active]:bg-[#000091] data-[state=active]:text-white">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Quittances</span>
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex items-center gap-2 data-[state=active]:bg-[#000091] data-[state=active]:text-white">
                <Archive className="w-4 h-4" />
                <span className="hidden sm:inline">Archive</span>
              </TabsTrigger>
              <TabsTrigger value="appartements" className="flex items-center gap-2 data-[state=active]:bg-[#000091] data-[state=active]:text-white">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Logements</span>
              </TabsTrigger>
              <TabsTrigger value="locataires" className="flex items-center gap-2 data-[state=active]:bg-[#000091] data-[state=active]:text-white">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Locataires</span>
              </TabsTrigger>
              <TabsTrigger value="bailleurs" className="flex items-center gap-2 data-[state=active]:bg-[#000091] data-[state=active]:text-white">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Bailleurs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quittances">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#000091]" />
                    Générer une quittance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuittanceGenerator
                    appartements={filteredAppartements}
                    bailleurs={bailleurs}
                    locataires={locataires}
                    quittances={filteredQuittances}
                    onSave={handleSaveQuittance}
                    getNextQuittanceNumber={getNextQuittanceNumber}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="archive">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="w-5 h-5 text-[#000091]" />
                    Quittances archivées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuittanceArchive
                    quittances={filteredQuittances}
                    appartements={filteredAppartements}
                    bailleurs={bailleurs}
                    locataires={locataires}
                    onDelete={deleteQuittance}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appartements">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-[#000091]" />
                    Logements ({filteredAppartements.length})
                  </CardTitle>
                  <Button onClick={() => setShowAppartementForm(true)} size="sm" className="bg-[#000091]">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {filteredAppartements.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Aucun logement. Ajoutez d&apos;abord un locataire puis un logement.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filteredAppartements.map((appt) => {
                        const locataireNames = appt.locataireIds
                          .map(id => locataires.find(l => l.id === id)?.nom)
                          .filter(Boolean)
                          .join(', ');
                        return (
                          <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{appt.adresse}</p>
                              <p className="text-sm text-gray-600">
                                Locataire(s) : {locataireNames || 'Non assigné'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Loyer : {appt.loyer.toFixed(2)} € + Charges : {appt.charges.toFixed(2)} €
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => { setEditingAppartement(appt); setShowAppartementForm(true); }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteAppartement(appt.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locataires">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#000091]" />
                    Locataires ({locataires.length})
                  </CardTitle>
                  <Button onClick={() => setShowLocataireForm(true)} size="sm" className="bg-[#000091]">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {locataires.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Aucun locataire enregistré.</p>
                  ) : (
                    <div className="space-y-3">
                      {locataires.map((loc) => (
                        <div key={loc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{loc.nom}</p>
                            <p className="text-sm text-gray-600">{loc.adresse}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingLocataire(loc); setShowLocataireForm(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteLocataire(loc.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bailleurs">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#000091]" />
                    Mes profils bailleurs ({bailleurs.length})
                  </CardTitle>
                  <Button onClick={() => setShowBailleurForm(true)} size="sm" className="bg-[#000091]">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bailleurs.map((bailleur) => (
                      <div 
                        key={bailleur.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                          bailleur.id === activeBailleurId 
                            ? 'bg-[#000091]/5 border-[#000091]' 
                            : 'bg-gray-50 border-transparent'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{bailleur.nom}</p>
                            {bailleur.id === activeBailleurId && (
                              <span className="text-xs bg-[#000091] text-white px-2 py-0.5 rounded">Actif</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{bailleur.adresse}</p>
                          <p className="text-xs text-gray-500">
                            {bailleur.type === 'societe' ? 'Société' : 'Personne physique'}
                            {bailleur.siret && ` • SIRET: ${bailleur.siret}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {bailleur.id !== activeBailleurId && (
                            <Button size="sm" variant="outline" onClick={() => setActiveBailleur(bailleur.id)}>
                              Activer
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => { setEditingBailleur(bailleur); setShowBailleurForm(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600" 
                            onClick={() => deleteBailleur(bailleur.id)}
                            disabled={bailleurs.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Dialog open={showBailleurForm} onOpenChange={(open) => { setShowBailleurForm(open); if (!open) setEditingBailleur(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBailleur ? 'Modifier le bailleur' : 'Nouveau bailleur'}</DialogTitle>
          </DialogHeader>
          <BailleurForm
            bailleur={editingBailleur}
            onSave={handleSaveBailleur}
            onCancel={() => { setShowBailleurForm(false); setEditingBailleur(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showLocataireForm} onOpenChange={(open) => { setShowLocataireForm(open); if (!open) setEditingLocataire(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocataire ? 'Modifier le locataire' : 'Nouveau locataire'}</DialogTitle>
          </DialogHeader>
          <LocataireForm
            locataire={editingLocataire}
            onSave={handleSaveLocataire}
            onCancel={() => { setShowLocataireForm(false); setEditingLocataire(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAppartementForm} onOpenChange={(open) => { setShowAppartementForm(open); if (!open) setEditingAppartement(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAppartement ? 'Modifier le logement' : 'Nouveau logement'}</DialogTitle>
          </DialogHeader>
          <AppartementForm
            appartement={editingAppartement}
            bailleurs={bailleurs}
            locataires={locataires}
            onSave={handleSaveAppartement}
            onCancel={() => { setShowAppartementForm(false); setEditingAppartement(null); }}
          />
        </DialogContent>
      </Dialog>

      <footer className="bg-[#1e1e1e] text-white py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>Générateur de quittances de loyer conformes à la loi n°89-462 du 6 juillet 1989</p>
          <p className="mt-1">Les données sont stockées localement sur votre appareil.</p>
        </div>
      </footer>
    </div>
  );
}