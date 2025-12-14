"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Bailleur, Locataire, Appartement, Quittance } from './types';

interface AppData {
  bailleurs: Bailleur[];
  locataires: Locataire[];
  appartements: Appartement[];
  quittances: Quittance[];
  activeBailleurId: string | null;
}

const STORAGE_KEY = 'quittance-loyer-data';

const defaultData: AppData = {
  bailleurs: [],
  locataires: [],
  appartements: [],
  quittances: [],
  activeBailleurId: null,
};

export function useLocalStorage() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(defaultData);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const setActiveBailleur = useCallback((id: string | null) => {
    setData(prev => ({ ...prev, activeBailleurId: id }));
  }, []);

  const addBailleur = useCallback((bailleur: Bailleur) => {
    setData(prev => ({
      ...prev,
      bailleurs: [...prev.bailleurs, bailleur],
      activeBailleurId: prev.activeBailleurId || bailleur.id,
    }));
  }, []);

  const updateBailleur = useCallback((bailleur: Bailleur) => {
    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.map(b => b.id === bailleur.id ? bailleur : b),
    }));
  }, []);

  const deleteBailleur = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.filter(b => b.id !== id),
      activeBailleurId: prev.activeBailleurId === id ? (prev.bailleurs[0]?.id || null) : prev.activeBailleurId,
    }));
  }, []);

  const addLocataire = useCallback((locataire: Locataire) => {
    setData(prev => ({
      ...prev,
      locataires: [...prev.locataires, locataire],
    }));
  }, []);

  const updateLocataire = useCallback((locataire: Locataire) => {
    setData(prev => ({
      ...prev,
      locataires: prev.locataires.map(l => l.id === locataire.id ? locataire : l),
    }));
  }, []);

  const deleteLocataire = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      locataires: prev.locataires.filter(l => l.id !== id),
    }));
  }, []);

  const addAppartement = useCallback((appartement: Appartement) => {
    setData(prev => ({
      ...prev,
      appartements: [...prev.appartements, appartement],
    }));
  }, []);

  const updateAppartement = useCallback((appartement: Appartement) => {
    setData(prev => ({
      ...prev,
      appartements: prev.appartements.map(a => a.id === appartement.id ? appartement : a),
    }));
  }, []);

  const deleteAppartement = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      appartements: prev.appartements.filter(a => a.id !== id),
    }));
  }, []);

  const addQuittance = useCallback((quittance: Quittance) => {
    setData(prev => ({
      ...prev,
      quittances: [...prev.quittances, quittance],
    }));
  }, []);

  const updateQuittance = useCallback((quittance: Quittance) => {
    setData(prev => ({
      ...prev,
      quittances: prev.quittances.map(q => q.id === quittance.id ? quittance : q),
    }));
  }, []);

  const deleteQuittance = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      quittances: prev.quittances.filter(q => q.id !== id),
    }));
  }, []);

  const getNextQuittanceNumber = useCallback((appartementId: string) => {
    const apptQuittances = data.quittances.filter(q => q.appartementId === appartementId);
    return apptQuittances.length > 0 ? Math.max(...apptQuittances.map(q => q.numero)) + 1 : 1;
  }, [data.quittances]);

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
  };
}
