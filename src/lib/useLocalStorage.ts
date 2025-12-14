"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Bailleur, Locataire, Appartement, Quittance, AppartementLocataire } from './types';

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
      const [bailleursRes, locatairesRes, appartementsRes, quittancesRes, appartLocRes] = await Promise.all([
        supabase.from('bailleurs').select('*').eq('user_id', user.id),
        supabase.from('locataires').select('*').eq('user_id', user.id),
        supabase.from('appartements').select('*').eq('user_id', user.id),
        supabase.from('quittances').select('*').eq('user_id', user.id),
        supabase.from('appartement_locataires').select('*'),
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

      const appartementLocataires = (appartLocRes.data || []).map(al => ({
        id: al.id,
        appartementId: al.appartement_id,
        locataireId: al.locataire_id,
        dateEntree: al.date_entree,
        dateSortie: al.date_sortie || undefined,
        loyer: al.loyer ? parseFloat(al.loyer) : undefined,
        charges: al.charges ? parseFloat(al.charges) : undefined,
      }));

      const quittances = (quittancesRes.data || []).map(q => ({
        id: q.id,
        numero: parseInt(q.numero),
        appartementId: q.appartement_id,
        locataireId: q.locataire_data?.locataireId,
        mois: q.mois,
        annee: q.annee,
        dateDebut: q.date_debut || '',
        dateFin: q.date_fin || '',
        datePaiement: q.date_paiement || '',
        dateEmission: q.date_emission || new Date(q.created_at).toISOString().split('T')[0],
        lieuEmission: q.lieu_emission || '',
        modePaiement: q.mode_paiement || 'virement',
        loyer: parseFloat(q.montant_loyer),
        charges: parseFloat(q.montant_charges),
        total: parseFloat(q.montant_total),
      }));

      setData({
        bailleurs,
        locataires,
        appartements,
        quittances,
        appartementLocataires,
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
    if (!user) throw new Error('User not authenticated');
    
    const { data: inserted, error } = await supabase
      .from('bailleurs')
      .insert({
        user_id: user.id,
        nom: bailleur.nom,
        adresse: bailleur.adresse,
        email: bailleur.email || null,
        type: bailleur.type,
        siret: bailleur.siret || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) throw new Error('No data returned from insert');

    const newBailleur: Bailleur = {
      id: inserted.id,
      nom: inserted.nom,
      adresse: inserted.adresse,
      email: inserted.email || undefined,
      type: inserted.type,
      siret: inserted.siret || undefined,
      telephone: bailleur.telephone || '',
    };

    setData(prev => ({
      ...prev,
      bailleurs: [...prev.bailleurs, newBailleur],
      activeBailleurId: prev.activeBailleurId || inserted.id,
    }));
  }, [user]);

  const updateBailleur = useCallback(async (bailleur: Bailleur) => {
    if (!user) return;

    const { error } = await supabase
      .from('bailleurs')
      .update({
        nom: bailleur.nom,
        adresse: bailleur.adresse,
        email: bailleur.email || null,
        type: bailleur.type,
        siret: bailleur.siret || null,
      })
      .eq('id', bailleur.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.map(b => b.id === bailleur.id ? bailleur : b),
    }));
  }, [user]);

  const deleteBailleur = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('bailleurs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.filter(b => b.id !== id),
      activeBailleurId: prev.activeBailleurId === id ? (prev.bailleurs[0]?.id || null) : prev.activeBailleurId,
    }));
  }, [user]);

  const addLocataire = useCallback(async (locataire: Locataire) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('locataires')
      .insert({
        user_id: user.id,
        nom: locataire.nom,
        adresse: locataire.adresse,
        email: locataire.email || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newLocataire: Locataire = {
      id: inserted.id,
      nom: inserted.nom,
      adresse: inserted.adresse,
      email: inserted.email || undefined,
      telephone: locataire.telephone || '',
    };

    setData(prev => ({
      ...prev,
      locataires: [...prev.locataires, newLocataire],
    }));
  }, [user]);

  const updateLocataire = useCallback(async (locataire: Locataire) => {
    if (!user) return;

    const { error } = await supabase
      .from('locataires')
      .update({
        nom: locataire.nom,
        adresse: locataire.adresse,
        email: locataire.email || null,
      })
      .eq('id', locataire.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      locataires: prev.locataires.map(l => l.id === locataire.id ? locataire : l),
    }));
  }, [user]);

  const deleteLocataire = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('locataires')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      locataires: prev.locataires.filter(l => l.id !== id),
    }));
  }, [user]);

  const addAppartement = useCallback(async (appartement: Appartement) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('appartements')
      .insert({
        user_id: user.id,
        bailleur_id: appartement.bailleurId,
        adresse: appartement.adresse,
        loyer: appartement.loyer,
        charges: appartement.charges,
        is_colocation: appartement.isColocation,
        loyer_par_locataire: appartement.loyerParLocataire || null,
        locataire_ids: appartement.locataireIds,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newAppartement: Appartement = {
      id: inserted.id,
      bailleurId: inserted.bailleur_id,
      adresse: inserted.adresse,
      loyer: parseFloat(inserted.loyer),
      charges: parseFloat(inserted.charges),
      isColocation: inserted.is_colocation,
      loyerParLocataire: inserted.loyer_par_locataire || undefined,
      locataireIds: inserted.locataire_ids,
      dateEntree: '',
    };

    setData(prev => ({
      ...prev,
      appartements: [...prev.appartements, newAppartement],
    }));
  }, [user]);

  const updateAppartement = useCallback(async (appartement: Appartement) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartements')
      .update({
        bailleur_id: appartement.bailleurId,
        adresse: appartement.adresse,
        loyer: appartement.loyer,
        charges: appartement.charges,
        is_colocation: appartement.isColocation,
        loyer_par_locataire: appartement.loyerParLocataire || null,
        locataire_ids: appartement.locataireIds,
      })
      .eq('id', appartement.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartements: prev.appartements.map(a => a.id === appartement.id ? appartement : a),
    }));
  }, [user]);

  const deleteAppartement = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartements')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartements: prev.appartements.filter(a => a.id !== id),
    }));
  }, [user]);

  const addQuittance = useCallback(async (quittance: Quittance) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('quittances')
      .insert({
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

    if (error) throw error;
    if (!inserted) return;

    const newQuittance: Quittance = {
      id: inserted.id,
      numero: parseInt(inserted.numero),
      appartementId: inserted.appartement_id,
      locataireId: inserted.locataire_data?.locataireId,
      bailleurId: '',
      mois: inserted.mois,
      annee: inserted.annee,
      montantLoyer: parseFloat(inserted.montant_loyer),
      montantCharges: parseFloat(inserted.montant_charges),
      dateCreation: new Date(inserted.created_at).toISOString(),
      lieuEmission: '',
      modePaiement: '',
      datePaiement: '',
      archived: true,
    };

    setData(prev => ({
      ...prev,
      quittances: [...prev.quittances, newQuittance],
    }));
  }, [user]);

  const updateQuittance = useCallback(async (quittance: Quittance) => {
    if (!user) return;

    const { error } = await supabase
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

    if (error) throw error;

    setData(prev => ({
      ...prev,
      quittances: prev.quittances.map(q => q.id === quittance.id ? quittance : q),
    }));
  }, [user]);

  const deleteQuittance = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('quittances')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      quittances: prev.quittances.filter(q => q.id !== id),
    }));
  }, [user]);

  const getNextQuittanceNumber = useCallback((appartementId: string) => {
    const apptQuittances = data.quittances.filter(q => q.appartementId === appartementId);
    return apptQuittances.length > 0 ? Math.max(...apptQuittances.map(q => q.numero)) + 1 : 1;
  }, [data.quittances]);

  const addAppartementLocataire = useCallback(async (rel: AppartementLocataire) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('appartement_locataires')
      .insert({
        appartement_id: rel.appartementId,
        locataire_id: rel.locataireId,
        date_entree: rel.dateEntree,
        date_sortie: rel.dateSortie || null,
        loyer: rel.loyer || null,
        charges: rel.charges || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newRel: AppartementLocataire = {
      id: inserted.id,
      appartementId: inserted.appartement_id,
      locataireId: inserted.locataire_id,
      dateEntree: inserted.date_entree,
      dateSortie: inserted.date_sortie || undefined,
      loyer: inserted.loyer ? parseFloat(inserted.loyer) : undefined,
      charges: inserted.charges ? parseFloat(inserted.charges) : undefined,
    };

    setData(prev => ({
      ...prev,
      appartementLocataires: [...prev.appartementLocataires, newRel],
    }));
  }, [user]);

  const deleteAppartementLocataire = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartement_locataires')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartementLocataires: prev.appartementLocataires.filter(al => al.id !== id),
    }));
  }, [user]);

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
}"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Bailleur, Locataire, Appartement, Quittance, AppartementLocataire } from './types';

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
      const [bailleursRes, locatairesRes, appartementsRes, quittancesRes, appartLocRes] = await Promise.all([
        supabase.from('bailleurs').select('*').eq('user_id', user.id),
        supabase.from('locataires').select('*').eq('user_id', user.id),
        supabase.from('appartements').select('*').eq('user_id', user.id),
        supabase.from('quittances').select('*').eq('user_id', user.id),
        supabase.from('appartement_locataires').select('*'),
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

      const appartementLocataires = (appartLocRes.data || []).map(al => ({
        id: al.id,
        appartementId: al.appartement_id,
        locataireId: al.locataire_id,
        dateEntree: al.date_entree,
        dateSortie: al.date_sortie || undefined,
        loyer: al.loyer ? parseFloat(al.loyer) : undefined,
        charges: al.charges ? parseFloat(al.charges) : undefined,
      }));

      const quittances = (quittancesRes.data || []).map(q => ({
        id: q.id,
        numero: parseInt(q.numero),
        appartementId: q.appartement_id,
        locataireId: q.locataire_data?.locataireId,
        mois: q.mois,
        annee: q.annee,
        dateDebut: q.date_debut || '',
        dateFin: q.date_fin || '',
        datePaiement: q.date_paiement || '',
        dateEmission: q.date_emission || new Date(q.created_at).toISOString().split('T')[0],
        lieuEmission: q.lieu_emission || '',
        modePaiement: q.mode_paiement || 'virement',
        loyer: parseFloat(q.montant_loyer),
        charges: parseFloat(q.montant_charges),
        total: parseFloat(q.montant_total),
      }));

      setData({
        bailleurs,
        locataires,
        appartements,
        quittances,
        appartementLocataires,
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
    if (!user) throw new Error('User not authenticated');
    
    const { data: inserted, error } = await supabase
      .from('bailleurs')
      .insert({
        user_id: user.id,
        nom: bailleur.nom,
        adresse: bailleur.adresse,
        email: bailleur.email || null,
        type: bailleur.type,
        siret: bailleur.siret || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) throw new Error('No data returned from insert');

    const newBailleur: Bailleur = {
      id: inserted.id,
      nom: inserted.nom,
      adresse: inserted.adresse,
      email: inserted.email || undefined,
      type: inserted.type,
      siret: inserted.siret || undefined,
      telephone: bailleur.telephone || '',
    };

    setData(prev => ({
      ...prev,
      bailleurs: [...prev.bailleurs, newBailleur],
      activeBailleurId: prev.activeBailleurId || inserted.id,
    }));
  }, [user]);

  const updateBailleur = useCallback(async (bailleur: Bailleur) => {
    if (!user) return;

    const { error } = await supabase
      .from('bailleurs')
      .update({
        nom: bailleur.nom,
        adresse: bailleur.adresse,
        email: bailleur.email || null,
        type: bailleur.type,
        siret: bailleur.siret || null,
      })
      .eq('id', bailleur.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.map(b => b.id === bailleur.id ? bailleur : b),
    }));
  }, [user]);

  const deleteBailleur = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('bailleurs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.filter(b => b.id !== id),
      activeBailleurId: prev.activeBailleurId === id ? (prev.bailleurs[0]?.id || null) : prev.activeBailleurId,
    }));
  }, [user]);

  const addLocataire = useCallback(async (locataire: Locataire) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('locataires')
      .insert({
        user_id: user.id,
        nom: locataire.nom,
        adresse: locataire.adresse,
        email: locataire.email || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newLocataire: Locataire = {
      id: inserted.id,
      nom: inserted.nom,
      adresse: inserted.adresse,
      email: inserted.email || undefined,
      telephone: locataire.telephone || '',
    };

    setData(prev => ({
      ...prev,
      locataires: [...prev.locataires, newLocataire],
    }));
  }, [user]);

  const updateLocataire = useCallback(async (locataire: Locataire) => {
    if (!user) return;

    const { error } = await supabase
      .from('locataires')
      .update({
        nom: locataire.nom,
        adresse: locataire.adresse,
        email: locataire.email || null,
      })
      .eq('id', locataire.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      locataires: prev.locataires.map(l => l.id === locataire.id ? locataire : l),
    }));
  }, [user]);

  const deleteLocataire = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('locataires')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      locataires: prev.locataires.filter(l => l.id !== id),
    }));
  }, [user]);

  const addAppartement = useCallback(async (appartement: Appartement) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('appartements')
      .insert({
        user_id: user.id,
        bailleur_id: appartement.bailleurId,
        adresse: appartement.adresse,
        loyer: appartement.loyer,
        charges: appartement.charges,
        is_colocation: appartement.isColocation,
        loyer_par_locataire: appartement.loyerParLocataire || null,
        locataire_ids: appartement.locataireIds,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newAppartement: Appartement = {
      id: inserted.id,
      bailleurId: inserted.bailleur_id,
      adresse: inserted.adresse,
      loyer: parseFloat(inserted.loyer),
      charges: parseFloat(inserted.charges),
      isColocation: inserted.is_colocation,
      loyerParLocataire: inserted.loyer_par_locataire || undefined,
      locataireIds: inserted.locataire_ids,
      dateEntree: '',
    };

    setData(prev => ({
      ...prev,
      appartements: [...prev.appartements, newAppartement],
    }));
  }, [user]);

  const updateAppartement = useCallback(async (appartement: Appartement) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartements')
      .update({
        bailleur_id: appartement.bailleurId,
        adresse: appartement.adresse,
        loyer: appartement.loyer,
        charges: appartement.charges,
        is_colocation: appartement.isColocation,
        loyer_par_locataire: appartement.loyerParLocataire || null,
        locataire_ids: appartement.locataireIds,
      })
      .eq('id', appartement.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartements: prev.appartements.map(a => a.id === appartement.id ? appartement : a),
    }));
  }, [user]);

  const deleteAppartement = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartements')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartements: prev.appartements.filter(a => a.id !== id),
    }));
  }, [user]);

  const addQuittance = useCallback(async (quittance: Quittance) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('quittances')
      .insert({
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

    if (error) throw error;
    if (!inserted) return;

    const newQuittance: Quittance = {
      id: inserted.id,
      numero: parseInt(inserted.numero),
      appartementId: inserted.appartement_id,
      locataireId: inserted.locataire_data?.locataireId,
      bailleurId: '',
      mois: inserted.mois,
      annee: inserted.annee,
      montantLoyer: parseFloat(inserted.montant_loyer),
      montantCharges: parseFloat(inserted.montant_charges),
      dateCreation: new Date(inserted.created_at).toISOString(),
      lieuEmission: '',
      modePaiement: '',
      datePaiement: '',
      archived: true,
    };

    setData(prev => ({
      ...prev,
      quittances: [...prev.quittances, newQuittance],
    }));
  }, [user]);

  const updateQuittance = useCallback(async (quittance: Quittance) => {
    if (!user) return;

    const { error } = await supabase
      .from('quittances')
      .update({
        appartement_id: quittance.appartementId,
        numero: quittance.numero.toString(),
        mois: quittance.mois,
        annee: quittance.annee,
        montant_loyer: quittance.loyer,
        montant_charges: quittance.charges,
        montant_total: quittance.total,
        locataire_data: { locataireId: quittance.locataireId },
        date_debut: quittance.dateDebut,
        date_fin: quittance.dateFin,
        date_paiement: quittance.datePaiement,
        date_emission: quittance.dateEmission,
        lieu_emission: quittance.lieuEmission,
        mode_paiement: quittance.modePaiement,
      })
      .eq('id', quittance.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      quittances: prev.quittances.map(q => q.id === quittance.id ? quittance : q),
    }));
  }, [user]);

  const deleteQuittance = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('quittances')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      quittances: prev.quittances.filter(q => q.id !== id),
    }));
  }, [user]);

  const getNextQuittanceNumber = useCallback((appartementId: string) => {
    const apptQuittances = data.quittances.filter(q => q.appartementId === appartementId);
    return apptQuittances.length > 0 ? Math.max(...apptQuittances.map(q => q.numero)) + 1 : 1;
  }, [data.quittances]);

  const addAppartementLocataire = useCallback(async (rel: AppartementLocataire) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('appartement_locataires')
      .insert({
        appartement_id: rel.appartementId,
        locataire_id: rel.locataireId,
        date_entree: rel.dateEntree,
        date_sortie: rel.dateSortie || null,
        loyer: rel.loyer || null,
        charges: rel.charges || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newRel: AppartementLocataire = {
      id: inserted.id,
      appartementId: inserted.appartement_id,
      locataireId: inserted.locataire_id,
      dateEntree: inserted.date_entree,
      dateSortie: inserted.date_sortie || undefined,
      loyer: inserted.loyer ? parseFloat(inserted.loyer) : undefined,
      charges: inserted.charges ? parseFloat(inserted.charges) : undefined,
    };

    setData(prev => ({
      ...prev,
      appartementLocataires: [...prev.appartementLocataires, newRel],
    }));
  }, [user]);

  const deleteAppartementLocataire = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartement_locataires')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartementLocataires: prev.appartementLocataires.filter(al => al.id !== id),
    }));
  }, [user]);

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
}"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Bailleur, Locataire, Appartement, Quittance, AppartementLocataire } from './types';

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
      const [bailleursRes, locatairesRes, appartementsRes, quittancesRes, appartLocRes] = await Promise.all([
        supabase.from('bailleurs').select('*').eq('user_id', user.id),
        supabase.from('locataires').select('*').eq('user_id', user.id),
        supabase.from('appartements').select('*').eq('user_id', user.id),
        supabase.from('quittances').select('*').eq('user_id', user.id),
        supabase.from('appartement_locataires').select('*'),
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

      const appartementLocataires = (appartLocRes.data || []).map(al => ({
        id: al.id,
        appartementId: al.appartement_id,
        locataireId: al.locataire_id,
        dateEntree: al.date_entree,
        dateSortie: al.date_sortie || undefined,
        loyer: al.loyer ? parseFloat(al.loyer) : undefined,
        charges: al.charges ? parseFloat(al.charges) : undefined,
      }));

      const quittances = (quittancesRes.data || []).map(q => ({
        id: q.id,
        numero: parseInt(q.numero),
        appartementId: q.appartement_id,
        locataireId: q.locataire_data?.locataireId,
        mois: q.mois,
        annee: q.annee,
        dateDebut: q.date_debut || '',
        dateFin: q.date_fin || '',
        datePaiement: q.date_paiement || '',
        dateEmission: q.date_emission || new Date(q.created_at).toISOString().split('T')[0],
        lieuEmission: q.lieu_emission || '',
        modePaiement: q.mode_paiement || 'virement',
        loyer: parseFloat(q.montant_loyer),
        charges: parseFloat(q.montant_charges),
        total: parseFloat(q.montant_total),
      }));

      setData({
        bailleurs,
        locataires,
        appartements,
        quittances,
        appartementLocataires,
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
    if (!user) throw new Error('User not authenticated');
    
    const { data: inserted, error } = await supabase
      .from('bailleurs')
      .insert({
        user_id: user.id,
        nom: bailleur.nom,
        adresse: bailleur.adresse,
        email: bailleur.email || null,
        type: bailleur.type,
        siret: bailleur.siret || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) throw new Error('No data returned from insert');

    const newBailleur: Bailleur = {
      id: inserted.id,
      nom: inserted.nom,
      adresse: inserted.adresse,
      email: inserted.email || undefined,
      type: inserted.type,
      siret: inserted.siret || undefined,
      telephone: bailleur.telephone || '',
    };

    setData(prev => ({
      ...prev,
      bailleurs: [...prev.bailleurs, newBailleur],
      activeBailleurId: prev.activeBailleurId || inserted.id,
    }));
  }, [user]);

  const updateBailleur = useCallback(async (bailleur: Bailleur) => {
    if (!user) return;

    const { error } = await supabase
      .from('bailleurs')
      .update({
        nom: bailleur.nom,
        adresse: bailleur.adresse,
        email: bailleur.email || null,
        type: bailleur.type,
        siret: bailleur.siret || null,
      })
      .eq('id', bailleur.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.map(b => b.id === bailleur.id ? bailleur : b),
    }));
  }, [user]);

  const deleteBailleur = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('bailleurs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      bailleurs: prev.bailleurs.filter(b => b.id !== id),
      activeBailleurId: prev.activeBailleurId === id ? (prev.bailleurs[0]?.id || null) : prev.activeBailleurId,
    }));
  }, [user]);

  const addLocataire = useCallback(async (locataire: Locataire) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('locataires')
      .insert({
        user_id: user.id,
        nom: locataire.nom,
        adresse: locataire.adresse,
        email: locataire.email || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newLocataire: Locataire = {
      id: inserted.id,
      nom: inserted.nom,
      adresse: inserted.adresse,
      email: inserted.email || undefined,
      telephone: locataire.telephone || '',
    };

    setData(prev => ({
      ...prev,
      locataires: [...prev.locataires, newLocataire],
    }));
  }, [user]);

  const updateLocataire = useCallback(async (locataire: Locataire) => {
    if (!user) return;

    const { error } = await supabase
      .from('locataires')
      .update({
        nom: locataire.nom,
        adresse: locataire.adresse,
        email: locataire.email || null,
      })
      .eq('id', locataire.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      locataires: prev.locataires.map(l => l.id === locataire.id ? locataire : l),
    }));
  }, [user]);

  const deleteLocataire = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('locataires')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      locataires: prev.locataires.filter(l => l.id !== id),
    }));
  }, [user]);

  const addAppartement = useCallback(async (appartement: Appartement) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('appartements')
      .insert({
        user_id: user.id,
        bailleur_id: appartement.bailleurId,
        adresse: appartement.adresse,
        loyer: appartement.loyer,
        charges: appartement.charges,
        is_colocation: appartement.isColocation,
        loyer_par_locataire: appartement.loyerParLocataire || null,
        locataire_ids: appartement.locataireIds,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newAppartement: Appartement = {
      id: inserted.id,
      bailleurId: inserted.bailleur_id,
      adresse: inserted.adresse,
      loyer: parseFloat(inserted.loyer),
      charges: parseFloat(inserted.charges),
      isColocation: inserted.is_colocation,
      loyerParLocataire: inserted.loyer_par_locataire || undefined,
      locataireIds: inserted.locataire_ids,
      dateEntree: '',
    };

    setData(prev => ({
      ...prev,
      appartements: [...prev.appartements, newAppartement],
    }));
  }, [user]);

  const updateAppartement = useCallback(async (appartement: Appartement) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartements')
      .update({
        bailleur_id: appartement.bailleurId,
        adresse: appartement.adresse,
        loyer: appartement.loyer,
        charges: appartement.charges,
        is_colocation: appartement.isColocation,
        loyer_par_locataire: appartement.loyerParLocataire || null,
        locataire_ids: appartement.locataireIds,
      })
      .eq('id', appartement.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartements: prev.appartements.map(a => a.id === appartement.id ? appartement : a),
    }));
  }, [user]);

  const deleteAppartement = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartements')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartements: prev.appartements.filter(a => a.id !== id),
    }));
  }, [user]);

  const addQuittance = useCallback(async (quittance: Quittance) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('quittances')
      .insert({
        user_id: user.id,
        appartement_id: quittance.appartementId,
        numero: quittance.numero.toString(),
        mois: quittance.mois,
        annee: quittance.annee,
        montant_loyer: quittance.loyer,
        montant_charges: quittance.charges,
        montant_total: quittance.total,
        locataire_data: { locataireId: quittance.locataireId },
        date_debut: quittance.dateDebut,
        date_fin: quittance.dateFin,
        date_paiement: quittance.datePaiement,
        date_emission: quittance.dateEmission,
        lieu_emission: quittance.lieuEmission,
        mode_paiement: quittance.modePaiement,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newQuittance: Quittance = {
      id: inserted.id,
      numero: parseInt(inserted.numero),
      appartementId: inserted.appartement_id,
      locataireId: inserted.locataire_data?.locataireId,
      mois: inserted.mois,
      annee: inserted.annee,
      dateDebut: inserted.date_debut,
      dateFin: inserted.date_fin,
      datePaiement: inserted.date_paiement,
      dateEmission: inserted.date_emission,
      lieuEmission: inserted.lieu_emission,
      modePaiement: inserted.mode_paiement,
      loyer: parseFloat(inserted.montant_loyer),
      charges: parseFloat(inserted.montant_charges),
      total: parseFloat(inserted.montant_total),
    };

    setData(prev => ({
      ...prev,
      quittances: [...prev.quittances, newQuittance],
    }));
  }, [user]);

  const updateQuittance = useCallback(async (quittance: Quittance) => {
    if (!user) return;

    const { error } = await supabase
      .from('quittances')
      .update({
        appartement_id: quittance.appartementId,
        numero: quittance.numero.toString(),
        mois: quittance.mois,
        annee: quittance.annee,
        montant_loyer: quittance.loyer,
        montant_charges: quittance.charges,
        montant_total: quittance.total,
        locataire_data: { locataireId: quittance.locataireId },
        date_debut: quittance.dateDebut,
        date_fin: quittance.dateFin,
        date_paiement: quittance.datePaiement,
        date_emission: quittance.dateEmission,
        lieu_emission: quittance.lieuEmission,
        mode_paiement: quittance.modePaiement,
      })
      .eq('id', quittance.id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      quittances: prev.quittances.map(q => q.id === quittance.id ? quittance : q),
    }));
  }, [user]);

  const deleteQuittance = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('quittances')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      quittances: prev.quittances.filter(q => q.id !== id),
    }));
  }, [user]);

  const getNextQuittanceNumber = useCallback((appartementId: string) => {
    const apptQuittances = data.quittances.filter(q => q.appartementId === appartementId);
    return apptQuittances.length > 0 ? Math.max(...apptQuittances.map(q => q.numero)) + 1 : 1;
  }, [data.quittances]);

  const addAppartementLocataire = useCallback(async (rel: AppartementLocataire) => {
    if (!user) return;

    const { data: inserted, error } = await supabase
      .from('appartement_locataires')
      .insert({
        appartement_id: rel.appartementId,
        locataire_id: rel.locataireId,
        date_entree: rel.dateEntree,
        date_sortie: rel.dateSortie || null,
        loyer: rel.loyer || null,
        charges: rel.charges || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!inserted) return;

    const newRel: AppartementLocataire = {
      id: inserted.id,
      appartementId: inserted.appartement_id,
      locataireId: inserted.locataire_id,
      dateEntree: inserted.date_entree,
      dateSortie: inserted.date_sortie || undefined,
      loyer: inserted.loyer ? parseFloat(inserted.loyer) : undefined,
      charges: inserted.charges ? parseFloat(inserted.charges) : undefined,
    };

    setData(prev => ({
      ...prev,
      appartementLocataires: [...prev.appartementLocataires, newRel],
    }));
  }, [user]);

  const deleteAppartementLocataire = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('appartement_locataires')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setData(prev => ({
      ...prev,
      appartementLocataires: prev.appartementLocataires.filter(al => al.id !== id),
    }));
  }, [user]);

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