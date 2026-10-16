// Contenu des faux sites d'exemple. Tout est FICTIF : noms, adresses, prix.
// Ne jamais y mettre une vraie marque ni un vrai client.

export interface Maquette {
  type: 'fleuriste' | 'traiteur' | 'galerie' | 'institut' | 'garage' | 'restaurant';
  nom: string;
  metier: string;
  quartier: string;
  accroche: string;
  action: string;
  ouvert: string;
  titreServices: string;
  services: [string, string][];
  horaires: [string, string][];
  adresse: string;
  police: string;
  couleurs: { fond: string; texte: string; accent: string; surAccent: string; doux: string; fleur: string };
}

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
const SANS = 'system-ui, sans-serif';

const horairesBoutique: [string, string][] = [
  ['Lundi', 'Fermé'],
  ['Mardi – vendredi', '9 h – 19 h 30'],
  ['Samedi', '9 h – 20 h'],
  ['Dimanche', '9 h – 13 h'],
];

export const maquettes: Record<Maquette['type'], Maquette> = {
  fleuriste: {
    type: 'fleuriste',
    nom: 'Ancolie',
    metier: 'Fleuriste',
    quartier: 'Paris 16e',
    accroche: 'Bouquets du jour, composés devant vous.',
    action: 'Appeler',
    ouvert: 'Ouvert aujourd’hui jusqu’à 19 h 30',
    titreServices: 'Nos bouquets',
    services: [
      ['Bouquet du jour', 'dès 35 €'],
      ['Livraison Paris 16e', '9 €'],
      ['Mariages et événements', 'sur devis'],
    ],
    horaires: horairesBoutique,
    adresse: 'Rue fictive, Paris 16e',
    police: SERIF,
    couleurs: { fond: '#fbf7f2', texte: '#2b2622', accent: '#7a3b4a', surAccent: '#ffffff', doux: '#efe4dc', fleur: '#c9806f' },
  },
  traiteur: {
    type: 'traiteur',
    nom: 'Table Haute',
    metier: 'Traiteur',
    quartier: 'Puteaux',
    accroche: 'Vos réceptions, du cocktail au dîner assis.',
    action: 'Demander un devis',
    ouvert: 'Réponse sous 24 h',
    titreServices: 'Formules',
    services: [
      ['Cocktail 12 pièces', '28 € / pers.'],
      ['Buffet du midi', '34 € / pers.'],
      ['Dîner assis', 'sur devis'],
    ],
    horaires: horairesBoutique,
    adresse: 'Rue fictive, Puteaux',
    police: SERIF,
    couleurs: { fond: '#f8f6f1', texte: '#23261f', accent: '#3d4f37', surAccent: '#ffffff', doux: '#e6e3d6', fleur: '#c08a3e' },
  },
  galerie: {
    type: 'galerie',
    nom: 'Galerie Onze',
    metier: 'Galerie d’art',
    quartier: 'Paris 8e',
    accroche: 'Exposition en cours : paysages d’hiver.',
    action: 'Préparer ma visite',
    ouvert: 'Entrée libre, du mardi au samedi',
    titreServices: 'À voir',
    services: [
      ['Exposition en cours', 'jusqu’au 30'],
      ['Artistes de la galerie', '8'],
      ['Visite privée', 'sur rendez-vous'],
    ],
    horaires: horairesBoutique,
    adresse: 'Rue fictive, Paris 8e',
    police: SANS,
    couleurs: { fond: '#ffffff', texte: '#161616', accent: '#161616', surAccent: '#ffffff', doux: '#ecebe8', fleur: '#b4543a' },
  },
  institut: {
    type: 'institut',
    nom: 'Rive Douce',
    metier: 'Institut de beauté',
    quartier: 'La Défense',
    accroche: 'Une heure pour vous, entre deux réunions.',
    action: 'Réserver',
    ouvert: 'Ouvert jusqu’à 20 h',
    titreServices: 'Soins',
    services: [
      ['Soin visage 45 min', '65 €'],
      ['Massage relaxant', '80 €'],
      ['Beauté des mains', '35 €'],
    ],
    horaires: horairesBoutique,
    adresse: 'Rue fictive, La Défense',
    police: SERIF,
    couleurs: { fond: '#faf6f3', texte: '#2e2826', accent: '#6b4f45', surAccent: '#ffffff', doux: '#efe3dc', fleur: '#d2a990' },
  },
  garage: {
    type: 'garage',
    nom: 'Atelier Méca 92',
    metier: 'Garage',
    quartier: 'Puteaux',
    accroche: 'Entretien et réparation, toutes marques.',
    action: 'Appeler le garage',
    ouvert: 'Ouvert jusqu’à 18 h 30',
    titreServices: 'Prestations',
    services: [
      ['Vidange + filtres', 'dès 89 €'],
      ['Freins avant', 'dès 140 €'],
      ['Diagnostic', '45 €'],
    ],
    horaires: horairesBoutique,
    adresse: 'Rue fictive, Puteaux',
    police: SANS,
    couleurs: { fond: '#f5f6f7', texte: '#1d2228', accent: '#24425e', surAccent: '#ffffff', doux: '#dfe3e7', fleur: '#d08a2e' },
  },
  restaurant: {
    type: 'restaurant',
    nom: 'Le Comptoir Vert',
    metier: 'Restaurant',
    quartier: 'Paris 8e',
    accroche: 'Cuisine de saison. Salle privatisable jusqu’à 40.',
    action: 'Réserver une table',
    ouvert: 'Service ce soir dès 19 h',
    titreServices: 'La carte',
    services: [
      ['Menu du midi', '24 €'],
      ['Plat du jour', '17 €'],
      ['Privatisation', 'sur devis'],
    ],
    horaires: horairesBoutique,
    adresse: 'Rue fictive, Paris 8e',
    police: SERIF,
    couleurs: { fond: '#f7f4ee', texte: '#22261f', accent: '#5c3a24', surAccent: '#ffffff', doux: '#e7e1d4', fleur: '#8f9c6a' },
  },
};
