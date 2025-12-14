"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Bailleur, Locataire, Appartement, Quittance } from './types';

interface AppData {
  bailleurs: Bailleur[];
  locataires: Locataire[];
  appartements: Appartement[];
  quittances: Quittance[];
  activeBailleurId: string | null;
}

const defaultData: AppData = {
  bailleurs: [],
  locataires: [],
  appartements: [],
  quittances: [],
  activeBailleurId: null,
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
      const [bailleursRes, locatairesRes, appartementsRes, quittancesRes] = await Promise.all([
        supabase.from('bailleurs').select('*').eq('user_id', user.id),
        supabase.from('locataires').select('*').eq('user_id', user.id),
        supabase.from('appartements').select('*').eq('user_id', user.id),
        supabase.from('quittances').select('*').eq('user_id', user.id),
      ]);

      const bailleurs = (bailleursRes.data || []).map(b => ({
        id: b.id,
        nom: b.nom,
        adresse: b.adresse,
        email: b.email,
        type: b.type,
        siret: b.siret,
        telephone: '',
      }));

      const locataires = (locatairesRes.data || []).map(l => ({
        id: l.id,
        nom: l.nom,
        adresse: l.adresse,
        email: l.email,
        telephone: '',
      }));

      const appartements = (appartementsRes.data || []).map(a => ({
        id: a.id,
        bailleurId: a.bailleur_id,
        adresse: a.adresse,
        loyer: parseFloat(a.loyer),
        charges: parseFloat(a.charges),
        isColocation: a.is_colocation,
        loyerParLocataire: a.loyer_par_locataire,
        locataireIds: a.locataire_ids,
        dateEntree: '',
      }));

      const quittances = (quittancesRes.data || []).map(q => ({
        id: q.id,
        numero: parseInt(q.numero),
        appartementId: q.appartement_id,
        locataireId: q.locataire_data?.locataireId,
        bailleurId: '',
        mois: q.mois,
        annee: q.annee,
        montantLoyer: parseFloat(q.montant_loyer),
        montantCharges: parseFloat(q.montant_charges),
        dateCreation: new Date(q.created_at).toISOString(),
        lieuEmission: '',
        modePaiement: '',
        datePaiement: '',
        archived: true,
      }));

      setData({
        bailleurs,
        locataires,
        appartements,
        quittances,
        activeBailleurId: bailleurs.length > 0 ? bailleurs[0].id : null,
      });
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
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
    if (!user) return;
    
    try {
      console.log('Starting addBailleur with:', { bailleur, userId: user.id });
      
      const { data: inserted, error } = await supabase
        .from('bailleurs')
        .insert({
          user_id: user.id,
          nom: bailleur.nom,
          adresse: bailleur.adresse,
          email: bailleur.email,
          type: bailleur.type,
          siret: bailleur.siret,
        })
        .select()
        .single();

      console.log('Supabase insert result:', { inserted, error });

      if (error) {
        console.error('Error adding bailleur:', error);
        throw error;
      }

      if (inserted) {
        console.log('Bailleur inserted successfully, updating local state');
        const newBailleur = {
          id: inserted.id,
          nom: inserted.nom,
          adresse: inserted.adresse,
          email: inserted.email,
          type: inserted.type,
          siret: inserted.siret,
          telephone: '',
        };
        setData(prev => ({
          ...prev,
          bailleurs: [...prev.bailleurs, newBailleur],
          activeBailleurId: prev.activeBailleurId || inserted.id,
        }));
        console.log('Calling loadData to refresh');
        await loadData();
        console.log('loadData completed');
      }
    } catch (error) {
      console.error('Error in addBailleur:', error);
      throw error;
    }
  }, [user, loadData]);

  const updateBailleur = useCallback(async (bailleur: Bailleur) => {
    if (!user) return;

    try {
      await supabase
        .from('bailleurs')
        .update({
          nom: bailleur.nom,
          adresse: bailleur.adresse,
          email: bailleur.email,
          type: bailleur.type,
          siret: bailleur.siret,
        })
        .eq('id', bailleur.id)
        .eq('user_id', user.id);

      setData(prev => ({
        ...prev,
        bailleurs: prev.bailleurs.map(b => b.id === bailleur.id ? bailleur : b),
      }));
    } catch (error) {
      console.error('Error updating bailleur:', error);
    }
  }, [user]);

  const deleteBailleur = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from('bailleurs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      setData(prev => ({
        ...prev,
        bailleurs: prev.bailleurs.filter(b => b.id !== id),
        activeBailleurId: prev.activeBailleurId === id ? (prev.bailleurs[0]?.id || null) : prev.activeBailleurId,
      }));
    } catch (error) {
      console.error('Error deleting bailleur:', error);
    }
  }, [user]);

  const addLocataire = useCallback(async (locataire: Locataire) => {
    if (!user) return;

    try {
      const { data: inserted } = await supabase
        .from('locataires')
        .insert({
          id: locataire.id,
          user_id: user.id,
          nom: locataire.nom,
          adresse: locataire.adresse,
          email: locataire.email,
        })
        .select()
        .single();

      if (inserted) {
        setData(prev => ({
          ...prev,
          locataires: [...prev.locataires, locataire],
        }));
      }
    } catch (error) {
      console.error('Error adding locataire:', error);
    }
  }, [user]);

  const updateLocataire = useCallback(async (locataire: Locataire) => {
    if (!user) return;

    try {
      await supabase
        .from('locataires')
        .update({
          nom: locataire.nom,
          adresse: locataire.adresse,
          email: locataire.email,
        })
        .eq('id', locataire.id)
        .eq('user_id', user.id);

      setData(prev => ({
        ...prev,
        locataires: prev.locataires.map(l => l.id === locataire.id ? locataire : l),
      }));
    } catch (error) {
      console.error('Error updating locataire:', error);
    }
  }, [user]);

  const deleteLocataire = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from('locataires')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      setData(prev => ({
        ...prev,
        locataires: prev.locataires.filter(l => l.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting locataire:', error);
    }
  }, [user]);

  const addAppartement = useCallback(async (appartement: Appartement) => {
    if (!user) return;

    try {
      const { data: inserted } = await supabase
        .from('appartements')
        .insert({
          id: appartement.id,
          user_id: user.id,
          bailleur_id: appartement.bailleurId,
          adresse: appartement.adresse,
          loyer: appartement.loyer,
          charges: appartement.charges,
          is_colocation: appartement.isColocation,
          loyer_par_locataire: appartement.loyerParLocataire,
          locataire_ids: appartement.locataireIds,
        })
        .select()
        .single();

      if (inserted) {
        setData(prev => ({
          ...prev,
          appartements: [...prev.appartements, appartement],
        }));
      }
    } catch (error) {
      console.error('Error adding appartement:', error);
    }
  }, [user]);

  const updateAppartement = useCallback(async (appartement: Appartement) => {
    if (!user) return;

    try {
      await supabase
        .from('appartements')
        .update({
          bailleur_id: appartement.bailleurId,
          adresse: appartement.adresse,
          loyer: appartement.loyer,
          charges: appartement.charges,
          is_colocation: appartement.isColocation,
          loyer_par_locataire: appartement.loyerParLocataire,
          locataire_ids: appartement.locataireIds,
        })
        .eq('id', appartement.id)
        .eq('user_id', user.id);

      setData(prev => ({
        ...prev,
        appartements: prev.appartements.map(a => a.id === appartement.id ? appartement : a),
      }));
    } catch (error) {
      console.error('Error updating appartement:', error);
    }
  }, [user]);

  const deleteAppartement = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from('appartements')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      setData(prev => ({
        ...prev,
        appartements: prev.appartements.filter(a => a.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting appartement:', error);
    }
  }, [user]);

  const addQuittance = useCallback(async (quittance: Quittance) => {
    if (!user) return;

    try {
      const { data: inserted } = await supabase
        .from('quittances')
        .insert({
          id: quittance.id,
          user_id: user.id,
          appartement_id: quittance.appartementId,
          numero: quittance.numero.toString(),
          mois: quittance.mois,
          annee: quittance.annee,
          montant_loyer: quittance.montantLoyer,
          montant_charges: quittance.montantCharges,
          montant_total: quittance.montantLoyer + quittance.montantCharges,
          locataire_data: { locataireId: quittance.locataireId },
        })
        .select()
        .single();

      if (inserted) {
        setData(prev => ({
          ...prev,
          quittances: [...prev.quittances, quittance],
        }));
      }
    } catch (error) {
      console.error('Error adding quittance:', error);
    }
  }, [user]);

  const updateQuittance = useCallback(async (quittance: Quittance) => {
    if (!user) return;

    try {
      await supabase
        .from('quittances')
        .update({
          appartement_id: quittance.appartementId,
          numero: quittance.numero.toString(),
          mois: quittance.mois,
          annee: quittance.annee,
          montant_loyer: quittance.montantLoyer,
          montant_charges: quittance.montantCharges,
          montant_total: quittance.montantLoyer + quittance.montantCharges,
          locataire_data: { locataireId: quittance.locataireId },
        })
        .eq('id', quittance.id)
        .eq('user_id', user.id);

      setData(prev => ({
        ...prev,
        quittances: prev.quittances.map(q => q.id === quittance.id ? quittance : q),
      }));
    } catch (error) {
      console.error('Error updating quittance:', error);
    }
  }, [user]);

  const deleteQuittance = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase
        .from('quittances')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      setData(prev => ({
        ...prev,
        quittances: prev.quittances.filter(q => q.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting quittance:', error);
    }
  }, [user]);

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