"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Bailleur, Locataire, Appartement, Quittance } from './types';

interface AppData {
  bailleurs: Bailleur[];
  locataires: Locataire[];
  appartements: Appartement[];
  quittances: Quittance[];
  activeBailleurId: string | null;
  initializedForUser?: string;
}

const STORAGE_KEY = 'quittance-loyer-data';

const defaultData: AppData = {
  bailleurs: [],
  locataires: [],
  appartements: [],
  quittances: [],
  activeBailleurId: null,
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function useLocalStorage() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const userStored = localStorage.getItem('user');
    let parsedData = defaultData;
    
    if (stored) {
      try {
        parsedData = JSON.parse(stored);
      } catch {
        parsedData = defaultData;
      }
    }

    if (userStored) {
      try {
        const user = JSON.parse(userStored);
        if (user.email === 'antoinelabet@gmail.com' && parsedData.bailleurs.length === 0 && !parsedData.initializedForUser) {
          const bailleurLabetConseilId = generateId();
          const bailleurAntoineLabetId = generateId();
          
          const locataireAnneId = generateId();
          const locataireMarionId = generateId();
          const locataireMatignonId = generateId();
          const locataireOlivierId = generateId();
          const locataireAmbreId = generateId();
          
          const apptTrappesId = generateId();
          const apptMontreuilId = generateId();
          
          parsedData = {
            ...parsedData,
            bailleurs: [
              {
                id: bailleurLabetConseilId,
                nom: 'Labet Conseil',
                adresse: '60, rue Jean Jaurès, 78190, Trappes',
                type: 'societe',
                siret: '12345678900012',
                email: 'contact@labetconseil.fr',
                telephone: '0601020304',
              },
              {
                id: bailleurAntoineLabetId,
                nom: 'Antoine Labet',
                adresse: '24, rue des Clos Français, 93100, Montreuil',
                type: 'particulier',
                email: 'antoinelabet@gmail.com',
                telephone: '0601020304',
              }
            ],
            locataires: [
              {
                id: locataireAnneId,
                nom: 'Donnadieu Anne Lise',
                adresse: '60, rue Jean Jaurès, 78190, Trappes',
                email: 'anne.donnadieu@email.com',
                telephone: '0612345678',
              },
              {
                id: locataireMarionId,
                nom: 'Durieux Marion',
                adresse: '60, rue Jean Jaurès, 78190, Trappes',
                email: 'marion.durieux@email.com',
                telephone: '0698765432',
              },
              {
                id: locataireMatignonId,
                nom: 'Matignon Ulysse',
                adresse: '24, rue des Clos Français, 93100, Montreuil',
                email: 'ulysse.matignon@email.com',
                telephone: '0687654321',
              },
              {
                id: locataireOlivierId,
                nom: 'Grave Olivier',
                adresse: '24, rue des Clos Français, 93100, Montreuil',
                email: 'olivier.grave@email.com',
                telephone: '0676543210',
              },
              {
                id: locataireAmbreId,
                nom: 'Pigeault Ambre',
                adresse: '24, rue des Clos Français, 93100, Montreuil',
                email: 'ambre.pigeault@email.com',
                telephone: '0665432109',
              }
            ],
            appartements: [
              {
                id: apptTrappesId,
                adresse: '60, rue Jean Jaurès, 78190, Trappes',
                bailleurId: bailleurLabetConseilId,
                locataireIds: [locataireAnneId, locataireMarionId],
                isColocation: true,
                loyer: 1110,
                charges: 190,
                dateEntree: '2024-01-01',
              },
              {
                id: apptMontreuilId,
                adresse: '24, rue des Clos Français, 93100, Montreuil',
                bailleurId: bailleurAntoineLabetId,
                locataireIds: [locataireMatignonId, locataireOlivierId, locataireAmbreId],
                isColocation: true,
                loyer: 1608,
                charges: 267,
                dateEntree: '2024-06-01',
              }
            ],
            quittances: [
              {
                id: generateId(),
                numero: 1,
                appartementId: apptTrappesId,
                locataireId: locataireMarionId,
                bailleurId: bailleurLabetConseilId,
                mois: 'Novembre',
                annee: 2025,
                montantLoyer: 650,
                montantCharges: 0,
                dateCreation: new Date('2025-11-14').toISOString(),
                lieuEmission: 'Paris',
                modePaiement: 'Virement bancaire',
                datePaiement: '14/11/2025',
                archived: true,
              },
              {
                id: generateId(),
                numero: 2,
                appartementId: apptTrappesId,
                locataireId: locataireMarionId,
                bailleurId: bailleurLabetConseilId,
                mois: 'Décembre',
                annee: 2025,
                montantLoyer: 650,
                montantCharges: 0,
                dateCreation: new Date('2025-12-14').toISOString(),
                lieuEmission: 'Paris',
                modePaiement: 'Virement bancaire',
                datePaiement: '14/12/2025',
                archived: true,
              }
            ],
            activeBailleurId: bailleurLabetConseilId,
            initializedForUser: user.email,
          };
        }
      } catch (e) {
        console.error('Error initializing user data:', e);
      }
    }

    setData(parsedData);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);

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