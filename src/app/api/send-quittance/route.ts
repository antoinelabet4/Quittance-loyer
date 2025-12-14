import { NextRequest, NextResponse } from 'next/server';
import type { Quittance, Bailleur, Locataire, Appartement } from '@/lib/types';
import { MOIS, formatMoney, formatDate } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, quittance, bailleur, locataire, appartement } = body as {
      type: 'email' | 'sms';
      to: string;
      quittance: Quittance;
      bailleur: Bailleur;
      locataire: Locataire;
      appartement: Appartement;
    };

    if (type === 'email') {
      const emailBody = generateEmailBody(quittance, bailleur, locataire, appartement);
      
      console.log('Envoi email :');
      console.log('De (expéditeur):', bailleur.email || bailleur.nom);
      console.log('À:', to);
      console.log('Sujet:', `Quittance de loyer - ${MOIS[quittance.mois]} ${quittance.annee}`);
      console.log('Corps:', emailBody);

      return NextResponse.json({ 
        success: true, 
        message: `Email simulé envoyé de ${bailleur.nom} à ${to} (configurez un service email pour l'envoi réel)` 
      });
    } else if (type === 'sms') {
      const smsBody = generateSMSBody(quittance, bailleur, locataire);
      
      console.log('Envoi SMS à:', to);
      console.log('Message:', smsBody);

      return NextResponse.json({ 
        success: true, 
        message: 'SMS simulé envoyé avec succès (configurez un service SMS pour l\'envoi réel)' 
      });
    }

    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function generateEmailBody(
  quittance: Quittance, 
  bailleur: Bailleur, 
  locataire: Locataire, 
  appartement: Appartement
): string {
  return `
Bonjour ${locataire.nom},

Veuillez trouver ci-joint votre quittance de loyer pour le mois de ${MOIS[quittance.mois]} ${quittance.annee}.

Détails de la quittance:
- Numéro: ${quittance.numero}
- Période: du ${formatDate(quittance.dateDebut)} au ${formatDate(quittance.dateFin)}
- Logement: ${appartement.adresse}
- Loyer: ${formatMoney(quittance.loyer)}
- Charges: ${formatMoney(quittance.charges)}
- Total: ${formatMoney(quittance.total)}

Cette quittance atteste que le loyer a été intégralement payé pour la période concernée.

Cordialement,
${bailleur.nom}
  `.trim();
}

function generateSMSBody(
  quittance: Quittance, 
  bailleur: Bailleur, 
  locataire: Locataire
): string {
  return `Quittance loyer ${MOIS[quittance.mois]} ${quittance.annee} N°${quittance.numero}: ${formatMoney(quittance.total)} payé. Merci. ${bailleur.nom}`;
}