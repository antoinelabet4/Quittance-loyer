import { NextRequest, NextResponse } from 'next/server';
import type { Quittance, Bailleur, Locataire, Appartement } from '@/lib/types';
import { MOIS, formatMoney, formatDate } from '@/lib/types';

export async function POST(request: NextRequest) {
  console.log('🔵 [API] Réception requête send-quittance');
  
  try {
    const body = await request.json();
    console.log('🔵 [API] Body reçu:', JSON.stringify(body, null, 2));
    
    const { type, to, recipient, quittance, bailleur, locataire, appartement } = body as {
      type: 'email' | 'sms';
      to: string;
      recipient?: 'bailleur' | 'locataire';
      quittance: Quittance;
      bailleur: Bailleur;
      locataire: Locataire;
      appartement: Appartement;
    };

    console.log('🔵 [API] Type:', type);
    console.log('🔵 [API] Destinataire:', to);
    console.log('🔵 [API] Recipient type:', recipient);
    console.log('🔵 [API] Bailleur:', bailleur.nom, bailleur.email);
    console.log('🔵 [API] Locataire:', locataire.nom, locataire.email);

    if (type === 'email') {
      const emailBody = generateEmailBody(quittance, bailleur, locataire, appartement);
      
      console.log('📧 [EMAIL] Configuration:');
      console.log('📧 [EMAIL] De (FROM):', bailleur.email || 'no-reply@quittance.com');
      console.log('📧 [EMAIL] Nom expéditeur:', bailleur.nom);
      console.log('📧 [EMAIL] À (TO):', to);
      console.log('📧 [EMAIL] Type destinataire:', recipient);
      console.log('📧 [EMAIL] Sujet:', `Quittance de loyer - ${MOIS[quittance.mois]} ${quittance.annee}`);
      console.log('📧 [EMAIL] Corps:', emailBody.substring(0, 200) + '...');
      console.log('📧 [EMAIL] RESEND_API_KEY présent:', !!process.env.RESEND_API_KEY);

      // Si Resend est configuré, envoyer un vrai email
      if (process.env.RESEND_API_KEY) {
        console.log('✅ [EMAIL] Resend configuré, tentative d\'envoi réel...');
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          const fromEmail = bailleur.email || 'no-reply@quittance.com';
          console.log('📧 [EMAIL] Envoi depuis:', fromEmail);
          
          const result = await resend.emails.send({
            from: `${bailleur.nom} <${fromEmail}>`,
            to: [to],
            subject: `Quittance de loyer - ${MOIS[quittance.mois]} ${quittance.annee}`,
            html: emailBody.replace(/\n/g, '<br>'),
          });
          
          console.log('✅ [EMAIL] Email envoyé avec succès via Resend:', result);
          
          return NextResponse.json({ 
            success: true, 
            message: `Email envoyé de ${bailleur.nom} (${fromEmail}) à ${to}`,
            result
          });
        } catch (resendError) {
          console.error('❌ [EMAIL] Erreur Resend:', resendError);
          return NextResponse.json({ 
            success: false, 
            error: 'Erreur lors de l\'envoi via Resend',
            details: resendError instanceof Error ? resendError.message : String(resendError)
          }, { status: 500 });
        }
      } else {
        console.log('⚠️ [EMAIL] Resend non configuré, simulation seulement');
        return NextResponse.json({ 
          success: true, 
          message: `Email simulé envoyé de ${bailleur.nom} (${bailleur.email}) à ${to}. Configurez RESEND_API_KEY pour l'envoi réel.` 
        });
      }
    } else if (type === 'sms') {
      const smsBody = generateSMSBody(quittance, bailleur, locataire);
      
      console.log('📱 [SMS] Envoi à:', to);
      console.log('📱 [SMS] Message:', smsBody);

      return NextResponse.json({ 
        success: true, 
        message: 'SMS simulé envoyé avec succès (configurez un service SMS pour l\'envoi réel)' 
      });
    }

    console.log('❌ [API] Type invalide:', type);
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  } catch (error) {
    console.error('❌ [API] Erreur critique:', error);
    console.error('❌ [API] Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
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