'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Bailleur, Locataire, Appartement, Quittance, AppartementLocataire } from './types';
import * as actions from './actions';

interface AppData {
  bailleurs: Bailleur[];
  locataires: Locataire[];
  appartements: Appartement[];
  quittances: Quittance[];
  appartementLocataires: AppartementLocataire[];
  activeBailleurId: string | null;
}

const defaultData: AppData = {
  bailleurs: [],
  locataires: [],
  appartements: [],
  quittances: [],
  appartementLocataires: [],
  activeBailleurId: null,
};

export function useLocalStorage() {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setData(defaultData);
      setIsLoaded(true);
      return;
    }

    try {
      const [bailleurs, locataires, appartements, quittances, appartementLocataires] = await Promise.all([
        actions.getBailleurs(),
        actions.getLocataires(),
        actions.getAppartements(),
        actions.getQuittances(),
        actions.getAppartementLocataires(),
      ]);

      setData({
        bailleurs: bailleurs.map(b => ({ ...b, telephone: b.telephone || '' })) as Bailleur[],
        locataires: locataires.map(l => ({ ...l, telephone: l.telephone || '' })) as Locataire[],
        appartements: appartements.map(a => ({
          ...a,
          loyer: Number(a.loyer),
          charges: Number(a.charges),
          loyerParLocataire: a.loyerParLocataire ? JSON.parse(a.loyerParLocataire as string) : undefined,
          locataireIds: a.locataireIds ? JSON.parse(a.locataireIds as string) : [],
        })) as unknown as Appartement[],
        quittances: quittances.map(q => ({
          ...q,
          loyer: Number(q.montantLoyer),
          charges: Number(q.montantCharges),
          total: Number(q.montantTotal),
          locataireId: q.locataireData ? (JSON.parse(q.locataireData as string)).locataireId : undefined,
        })) as unknown as Quittance[],
        appartementLocataires: appartementLocataires.map(al => ({
          ...al,
          loyer: al.loyer ? Number(al.loyer) : undefined,
          charges: al.charges ? Number(al.charges) : undefined,
        })) as unknown as AppartementLocataire[],
        activeBailleurId: bailleurs.length > 0 ? bailleurs[0].id : null,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setData(defaultData);
    }

    setIsLoaded(true);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setActiveBailleur = useCallback((id: string | null) => {
    setData(prev => ({ ...prev, activeBailleurId: id }));
  }, []);

  const addBailleur = useCallback(async (bailleur: Bailleur) => {
    const id = await actions.addBailleur({
      nom: bailleur.nom,
      adresse: bailleur.adresse,
      email: bailleur.email,
      type: bailleur.type,
      siret: bailleur.siret,
      telephone: bailleur.telephone,
    });
    
    const newBailleur = { ...bailleur, id };
    setData(prev => ({
      ...prev,
      bailleurs: [...prev.bailleurs, newBailleur],
      activeBailleurId: prev.activeBailleurId || id,
    }));
  }, []);

  const updateBailleur = useCallback(async (bailleur: Bailleur) => {
    await actions.updateBailleur(bailleur.id, {
      nom: bailleur.nom,
      adresse: bailleur.adresse,
      email: bailleur.email,
      type: bailleur.type,
      siret: bailleur.siret,
      telephone: bailleur.telephone,
    });
    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.map(b => b.id === bailleur.id ? bailleur : b),
    }));
  }, []);

  const deleteBailleur = useCallback(async (id: string) => {
    await actions.deleteBailleur(id);
    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.filter(b => b.id !== id),
      activeBailleurId: prev.activeBailleurId === id ? (prev.bailleurs[0]?.id || null) : prev.activeBailleurId,
    }));
  }, []);

  const addLocataire = useCallback(async (locataire: Locataire) => {
    const id = await actions.addLocataire({
      nom: locataire.nom,
      adresse: locataire.adresse,
      email: locataire.email,
      telephone: locataire.telephone,
    });
    const newLocataire = { ...locataire, id };
    setData(prev => ({
      ...prev,
      locataires: [...prev.locataires, newLocataire],
    }));
  }, []);

  const updateLocataire = useCallback(async (locataire: Locataire) => {
    await actions.updateLocataire(locataire.id, {
      nom: locataire.nom,
      adresse: locataire.adresse,
      email: locataire.email,
      telephone: locataire.telephone,
    });
    setData(prev => ({
      ...prev,
      locataires: prev.locataires.map(l => l.id === locataire.id ? locataire : l),
    }));
  }, []);

  const deleteLocataire = useCallback(async (id: string) => {
    await actions.deleteLocataire(id);
    setData(prev => ({
      ...prev,
      locataires: prev.locataires.filter(l => l.id !== id),
    }));
  }, []);

  const addAppartement = useCallback(async (appartement: Appartement) => {
    const id = await actions.addAppartement({
      bailleurId: appartement.bailleurId,
      adresse: appartement.adresse,
      loyer: appartement.loyer,
      charges: appartement.charges,
      isColocation: appartement.isColocation,
      loyerParLocataire: JSON.stringify(appartement.loyerParLocataire),
      locataireIds: JSON.stringify(appartement.locataireIds),
    });
    const newAppartement = { ...appartement, id };
    setData(prev => ({
      ...prev,
      appartements: [...prev.appartements, newAppartement],
    }));
  }, []);

  const updateAppartement = useCallback(async (appartement: Appartement) => {
    await actions.updateAppartement(appartement.id, {
      bailleurId: appartement.bailleurId,
      adresse: appartement.adresse,
      loyer: appartement.loyer,
      charges: appartement.charges,
      isColocation: appartement.isColocation,
      loyerParLocataire: JSON.stringify(appartement.loyerParLocataire),
      locataireIds: JSON.stringify(appartement.locataireIds),
    });
    setData(prev => ({
      ...prev,
      appartements: prev.appartements.map(a => a.id === appartement.id ? appartement : a),
    }));
  }, []);

  const deleteAppartement = useCallback(async (id: string) => {
    await actions.deleteAppartement(id);
    setData(prev => ({
      ...prev,
      appartements: prev.appartements.filter(a => a.id !== id),
    }));
  }, []);

  const addQuittance = useCallback(async (quittance: Quittance) => {
    const id = await actions.addQuittance({
      appartementId: quittance.appartementId,
      numero: quittance.numero,
      mois: quittance.mois,
      annee: quittance.annee,
      montantLoyer: quittance.loyer,
      montantCharges: quittance.charges,
      montantTotal: quittance.total,
      locataireData: JSON.stringify({ locataireId: quittance.locataireId }),
      dateDebut: quittance.dateDebut,
      dateFin: quittance.dateFin,
      datePaiement: quittance.datePaiement,
      dateEmission: quittance.dateEmission,
      lieuEmission: quittance.lieuEmission,
      modePaiement: quittance.modePaiement,
    });
    const newQuittance = { ...quittance, id };
    setData(prev => ({
      ...prev,
      quittances: [...prev.quittances, newQuittance],
    }));
  }, []);

  const updateQuittance = useCallback(async (quittance: Quittance) => {
    await actions.updateQuittance(quittance.id, {
      appartementId: quittance.appartementId,
      numero: quittance.numero,
      mois: quittance.mois,
      annee: quittance.annee,
      montantLoyer: quittance.loyer,
      montantCharges: quittance.charges,
      montantTotal: quittance.total,
      locataireData: JSON.stringify({ locataireId: quittance.locataireId }),
      dateDebut: quittance.dateDebut,
      dateFin: quittance.dateFin,
      datePaiement: quittance.datePaiement,
      dateEmission: quittance.dateEmission,
      lieuEmission: quittance.lieuEmission,
      modePaiement: quittance.modePaiement,
    });
    setData(prev => ({
      ...prev,
      quittances: prev.quittances.map(q => q.id === quittance.id ? quittance : q),
    }));
  }, []);

  const deleteQuittance = useCallback(async (id: string) => {
    await actions.deleteQuittance(id);
    setData(prev => ({
      ...prev,
      quittances: prev.quittances.filter(q => q.id !== id),
    }));
  }, []);

  const getNextQuittanceNumber = useCallback((appartementId: string) => {
    const apptQuittances = data.quittances.filter(q => q.appartementId === appartementId);
    return apptQuittances.length > 0 ? Math.max(...apptQuittances.map(q => q.numero)) + 1 : 1;
  }, [data.quittances]);

  const addAppartementLocataire = useCallback(async (rel: AppartementLocataire) => {
    const id = await actions.addAppartementLocataire(rel);
    const newRel = { ...rel, id };
    setData(prev => ({
      ...prev,
      appartementLocataires: [...prev.appartementLocataires, newRel],
    }));
  }, []);

  const deleteAppartementLocataire = useCallback(async (id: string) => {
    await actions.deleteAppartementLocataire(id);
    setData(prev => ({
      ...prev,
      appartementLocataires: prev.appartementLocataires.filter(al => al.id !== id),
    }));
  }, []);

  return {
    ...data,
    isLoaded,
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
    addAppartementLocataire,
    deleteAppartementLocataire,
  };
}
