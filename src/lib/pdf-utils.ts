import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quittance, Bailleur, Locataire, Appartement } from './types';

export async function generateQuittancePDF(
  quittance: Quittance,
  bailleur: Bailleur,
  locataire: Locataire,
  appartement: Appartement
): Promise<void> {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-99999px';
  tempDiv.style.width = '210mm';
  tempDiv.style.padding = '20mm';
  tempDiv.style.backgroundColor = '#ffffff';
  document.body.appendChild(tempDiv);

  const { createRoot } = await import('react-dom/client');
  const { QuittancePreview } = await import('@/components/QuittancePreview');
  
  const root = createRoot(tempDiv);
  
  await new Promise<void>((resolve) => {
    root.render(
      QuittancePreview({
        quittance,
        bailleur,
        locataire,
        appartement
      })
    );
    setTimeout(resolve, 1000);
  });

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    const moisStr = String(quittance.mois + 1).padStart(2, '0');
    const anneeStr = String(quittance.annee).slice(-2);
    const nomClean = locataire.nom.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    
    pdf.save(`quittance_${nomClean}_${moisStr}_${anneeStr}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(tempDiv);
  }
}
