import jsPDF from 'jspdf';
import { Quittance, Bailleur, Locataire, Appartement } from './types';
import { MOIS, numberToWords, formatDate, formatMoney } from './types';

export async function generateQuittancePDF(
  quittance: Quittance,
  bailleur: Bailleur,
  locataire: Locataire,
  appartement: Appartement,
  signatureData?: string | null
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let yPos = margin;

  const totalEnLettres = numberToWords(Math.floor(quittance.total));
  const centimes = Math.round((quittance.total % 1) * 100);
  const totalLettresComplet = centimes > 0 
    ? `${totalEnLettres} euros et ${numberToWords(centimes)} centimes`
    : `${totalEnLettres} euros`;

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  const disclaimer = "La présente quittance de loyer est établie conformément aux dispositions des articles 21 et 21-2 de la loi n°89-462 du 6 juillet 1989, tendant à améliorer les rapports locatifs, ainsi qu'aux articles 1714 et suivants du Code civil relatifs aux baux d'habitation. Elle atteste du paiement intégral du loyer et des charges pour la période indiquée, et décharge le locataire de toute obligation de ce chef pour ladite période.";
  const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth);
  pdf.text(disclaimerLines, margin, yPos);
  yPos += disclaimerLines.length * 4 + 8;

  pdf.setLineWidth(0.8);
  pdf.rect(margin, yPos, contentWidth, 15);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(`QUITTANCE DE LOYER N° : ${quittance.numero}`, pageWidth / 2, yPos + 10, { align: 'center' });
  yPos += 20;

  const addSection = (title: string, items: { label: string, value: string }[]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(title, margin, yPos);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
    yPos += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    items.forEach((item, index) => {
      pdf.setFillColor(232, 232, 240);
      pdf.rect(margin, yPos, contentWidth, 7, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.label, margin + 2, yPos + 5);
      pdf.setFont('helvetica', 'normal');
      const labelWidth = pdf.getTextWidth(item.label);
      pdf.text(item.value, margin + 2 + labelWidth, yPos + 5);
      yPos += index < items.length - 1 ? 8 : 9;
    });
  };

  const bailleurItems = [
    { label: 'Nom et prénom ou Dénomination sociale : ', value: bailleur.nom },
    { label: 'Adresse du domicile ou Siège social : ', value: bailleur.adresse }
  ];
  if (bailleur.siret) {
    bailleurItems.push({ label: 'SIRET : ', value: bailleur.siret });
  }
  addSection('Bailleur :', bailleurItems);

  const locataireItems = [
    { label: 'Nom et prénom ou Dénomination sociale : ', value: locataire.nom },
    { label: 'Adresse du domicile ou Siège social : ', value: locataire.adresse }
  ];
  addSection('Locataire :', locataireItems);

  pdf.setFillColor(232, 232, 240);
  pdf.rect(margin, yPos, contentWidth, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Date : ', margin + 2, yPos + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(quittance.datePaiement), margin + 2 + pdf.getTextWidth('Date : '), yPos + 5);
  yPos += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Période concernée :', margin, yPos);
  yPos += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Du : ${formatDate(quittance.dateDebut)}`, margin, yPos);
  yPos += 5;
  pdf.text(`Au : ${formatDate(quittance.dateFin)}`, margin, yPos);
  pdf.setLineWidth(0.3);
  pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const mainText = `Je soussigné(e), ${bailleur.nom}, propriétaire du logement situé au ${appartement.adresse}, reconnais avoir reçu de ${locataire.nom} la somme totale de ${formatMoney(quittance.total)} (en lettres ${totalLettresComplet}), correspondant au paiement du loyer et des charges pour la période indiquée ci-dessus.`;
  const mainTextLines = pdf.splitTextToSize(mainText, contentWidth);
  pdf.text(mainTextLines, margin, yPos);
  yPos += mainTextLines.length * 5 + 5;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Détail du paiement :', margin, yPos);
  yPos += 7;

  const detailItems = [
    { label: 'Loyer : ', value: formatMoney(quittance.loyer) },
    { label: 'Provision pour charges : ', value: formatMoney(quittance.charges) },
    { label: 'Total payé : ', value: formatMoney(quittance.total) }
  ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  detailItems.forEach((item, index) => {
    pdf.setFillColor(232, 232, 240);
    pdf.rect(margin, yPos, contentWidth, 7, 'F');
    if (index === 2) {
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos + 7, pageWidth - margin, yPos + 7);
    }
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.label, margin + 2, yPos + 5);
    pdf.setFont('helvetica', 'normal');
    const labelWidth = pdf.getTextWidth(item.label);
    pdf.text(item.value, margin + 2 + labelWidth, yPos + 5);
    yPos += 8;
  });
  yPos += 3;

  pdf.setLineWidth(0.3);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  const quittanceText = "Le locataire est, par la présente, quitte et libéré de tout paiement au titre du loyer et des charges pour la période mentionnée.";
  const quittanceTextLines = pdf.splitTextToSize(quittanceText, contentWidth);
  pdf.text(quittanceTextLines, margin, yPos);
  yPos += quittanceTextLines.length * 5 + 2;
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Mode de paiement :', margin, yPos);
  yPos += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const modes = [
    { key: 'virement', label: 'Virement bancaire' },
    { key: 'cheque', label: 'Chèque' },
    { key: 'especes', label: 'Espèces' },
    { key: 'prelevement', label: 'Prélèvement automatique' },
    { key: 'autre', label: 'Autre' }
  ];

  modes.forEach(mode => {
    const isChecked = quittance.modePaiement === mode.key;
    pdf.rect(margin, yPos, 4, 4, isChecked ? 'F' : 'S');
    pdf.text(mode.label, margin + 6, yPos + 3);
    yPos += 6;
  });
  yPos += 3;

  pdf.setLineWidth(0.3);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Fait à : ${quittance.lieuEmission}     le : ${formatDate(quittance.dateEmission)}`, margin, yPos);
  yPos += 10;

  pdf.setLineWidth(0.5);
  pdf.rect(margin, yPos, 65, 30);
  
  if (signatureData) {
    try {
      pdf.addImage(signatureData, 'PNG', margin + 2, yPos + 2, 61, 26);
    } catch (err) {
      console.error('Erreur ajout signature:', err);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.text('Signature du bailleur', margin + 2, yPos + 15);
    }
  } else {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9);
    pdf.text('Signature du bailleur', margin + 2, yPos + 15);
  }

  pdf.setLineWidth(1.5);
  pdf.setDrawColor(0, 85, 164);
  pdf.setTextColor(0, 85, 164);
  const stampX = pageWidth - margin - 40;
  const stampY = yPos + 5;
  pdf.rect(stampX, stampY, 35, 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('PAYÉ', stampX + 17.5, stampY + 13, { align: 'center', angle: -15 });

  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Quittance de loyer - ${MOIS[quittance.mois]} ${quittance.annee}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  const moisStr = String(quittance.mois + 1).padStart(2, '0');
  const anneeStr = String(quittance.annee).slice(-2);
  const nomClean = locataire.nom.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  
  pdf.save(`quittance_${nomClean}_${moisStr}_${anneeStr}.pdf`);
}
