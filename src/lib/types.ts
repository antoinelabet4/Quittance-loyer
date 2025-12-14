export interface Bailleur {
  id: string;
  nom: string;
  adresse: string;
  type: 'personne_physique' | 'societe';
  siret?: string;
  email?: string;
  telephone?: string;
}

export interface Locataire {
  id: string;
  nom: string;
  adresse: string;
  email?: string;
  telephone?: string;
}

export interface Appartement {
  id: string;
  adresse: string;
  bailleurId: string;
  locataireId: string;
  loyer: number;
  charges: number;
  dateEntree: string;
}

export interface Quittance {
  id: string;
  numero: number;
  appartementId: string;
  mois: number;
  annee: number;
  dateDebut: string;
  dateFin: string;
  datePaiement: string;
  dateEmission: string;
  lieuEmission: string;
  modePaiement: 'virement' | 'cheque' | 'especes' | 'prelevement' | 'autre';
  loyer: number;
  charges: number;
  total: number;
}

export type ModePaiement = 'virement' | 'cheque' | 'especes' | 'prelevement' | 'autre';

export const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function numberToWords(n: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  
  if (n === 0) return 'zéro';
  if (n < 0) return 'moins ' + numberToWords(-n);
  
  const convertHundreds = (num: number): string => {
    if (num === 0) return '';
    if (num < 20) return units[num];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      if (ten === 7 || ten === 9) {
        return tens[ten] + (unit === 1 && ten !== 9 ? '-et-' : '-') + units[10 + unit];
      }
      if (unit === 0) return tens[ten] + (ten === 8 ? 's' : '');
      if (unit === 1 && ten !== 8) return tens[ten] + '-et-' + units[unit];
      return tens[ten] + '-' + units[unit];
    }
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    let result = hundred === 1 ? 'cent' : units[hundred] + ' cent';
    if (rest === 0 && hundred > 1) return result + 's';
    if (rest > 0) result += ' ' + convertHundreds(rest);
    return result;
  };

  if (n < 1000) return convertHundreds(n);
  
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    let result = thousands === 1 ? 'mille' : convertHundreds(thousands) + ' mille';
    if (rest > 0) result += ' ' + convertHundreds(rest);
    return result;
  }

  return n.toString();
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatMoney(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
