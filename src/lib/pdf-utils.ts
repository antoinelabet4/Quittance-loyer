import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quittance, Bailleur, Locataire, Appartement } from './types';
import React from 'react';

export async function generateQuittancePDF(
  quittance: Quittance,
  bailleur: Bailleur,
  locataire: Locataire,
  appartement: Appartement
): Promise<void> {
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = `
    position: absolute;
    left: -99999px;
    width: 210mm;
    padding: 0;
    background: white;
    font-family: ui-serif, Georgia, serif;
  `;
  document.body.appendChild(tempDiv);

  const { createRoot } = await import('react-dom/client');
  const { QuittancePreview } = await import('@/components/QuittancePreview');
  
  const root = createRoot(tempDiv);
  
  try {
    await new Promise<void>((resolve) => {
      root.render(
        React.createElement(QuittancePreview, {
          quittance,
          bailleur,
          locataire,
          appartement
        })
      );
      setTimeout(resolve, 1200);
    });

    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body.querySelector('div');
        if (clonedElement) {
          clonedElement.style.backgroundColor = '#ffffff';
        }
      }
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
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    throw error;
  } finally {
    root.unmount();
    document.body.removeChild(tempDiv);
  }
}
