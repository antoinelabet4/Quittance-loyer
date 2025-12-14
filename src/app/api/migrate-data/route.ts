import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { userId, bailleurs, locataires, appartements, quittances } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = {
      bailleurs: 0,
      locataires: 0,
      appartements: 0,
      quittances: 0,
      errors: [] as string[]
    };

    if (bailleurs && Array.isArray(bailleurs)) {
      for (const bailleur of bailleurs) {
        const { error } = await supabase
          .from('bailleurs')
          .upsert({ ...bailleur, user_id: userId });
        if (error) {
          results.errors.push(`Bailleur ${bailleur.id}: ${error.message}`);
        } else {
          results.bailleurs++;
        }
      }
    }

    if (locataires && Array.isArray(locataires)) {
      for (const locataire of locataires) {
        const { error } = await supabase
          .from('locataires')
          .upsert({ ...locataire, user_id: userId });
        if (error) {
          results.errors.push(`Locataire ${locataire.id}: ${error.message}`);
        } else {
          results.locataires++;
        }
      }
    }

    if (appartements && Array.isArray(appartements)) {
      for (const appartement of appartements) {
        const { error } = await supabase
          .from('appartements')
          .upsert({ 
            ...appartement, 
            user_id: userId,
            locataire_ids: appartement.locataireIds,
            bailleur_id: appartement.bailleurId,
            is_colocation: appartement.isColocation,
            loyer_par_locataire: appartement.loyerParLocataire
          });
        if (error) {
          results.errors.push(`Appartement ${appartement.id}: ${error.message}`);
        } else {
          results.appartements++;
        }
      }
    }

    if (quittances && Array.isArray(quittances)) {
      for (const quittance of quittances) {
        const { error } = await supabase
          .from('quittances')
          .upsert({ 
            ...quittance, 
            user_id: userId,
            appartement_id: quittance.appartementId,
            locataire_id: quittance.locataireId,
            date_emission: quittance.dateEmission,
            date_paiement: quittance.datePaiement,
            debut_periode: quittance.debutPeriode,
            fin_periode: quittance.finPeriode,
            mode_paiement: quittance.modePaiement
          });
        if (error) {
          results.errors.push(`Quittance ${quittance.id}: ${error.message}`);
        } else {
          results.quittances++;
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
