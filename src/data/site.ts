// ─────────────────────────────────────────────────────────────────────────────
//  Devanture — TOUS les textes et réglages modifiables sont ici.
//  Les valeurs entre crochets [COMME_CECI] sont à remplacer avant la mise en ligne.
//  Voir README.md, section « Modifier le site ».
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  nom: 'Devanture',
  promesse: 'Votre devanture, aussi sur Google.',
  description:
    'Devanture crée le site web des commerces indépendants à Paris et dans toute l’Île-de-France. Maquette gratuite, site en ligne en 2 à 3 jours, sans engagement.',

  // Contact — téléphone au format affiché ET au format lien (sans espaces, avec +33).
  telephone: '07 69 75 14 79',
  telephoneLien: '+33769751479',
  email: 'devanture.paris@gmail.com',

  region: 'Paris et toute l’Île-de-France',
  zones: ['Paris', 'Hauts-de-Seine', 'Seine-Saint-Denis', 'Val-de-Marne', 'Yvelines', 'Essonne', 'Seine-et-Marne', 'Val-d’Oise'],
  delai: '2 à 3 jours',

  // Pas de prix affiché : il dépend de la demande, le client appelle pour le connaître.

  // Envoi du questionnaire : fonction api/maquette.js, qui transfère chaque demande en un seul e-mail
  // à devanture.paris@gmail.com (via FormSubmit). Pour changer d'adresse, voir api/maquette.js.
  formulaireAdresse: '/api/maquette',

  // Mentions légales
  editeur: {
    nom: '[NOM PRÉNOM]',
    statut: '[STATUT JURIDIQUE]', // ex. « Entrepreneur individuel (micro-entreprise) »
    siret: '[SIRET]',
    adresse: '[ADRESSE]',
  },
  dureeConservation: '[DURÉE]', // ex. « 3 ans après notre dernier échange »
};

/** Une valeur est-elle encore à remplacer ? (sert à ne pas publier de fausses données structurées) */
export const aRemplacer = (valeur: string) => valeur.includes('[');

export const metiers = [
  'Fleuriste',
  'Traiteur',
  'Galerie d’art',
  'Antiquaire',
  'Chocolatier ou pâtissier',
  'Bijoutier',
  'Boutique de déco',
  'Boutique de mode',
  'Institut de beauté',
  'Barbier ou coiffeur',
  'Garage',
  'Serrurier',
  'Auto-école',
  'Restaurant',
  'Autre commerce',
];

export const etapes = [
  {
    titre: 'On prépare votre maquette',
    texte:
      'Envoyez-nous quelques photos de votre commerce. Nous dessinons votre page d’accueil, gratuitement.',
  },
  {
    titre: 'Vous validez',
    texte:
      'Vous regardez la maquette sur votre téléphone. Un détail ne vous plaît pas ? On le change.',
  },
  {
    titre: 'Votre site est en ligne',
    texte: '2 à 3 jours plus tard, vos clients vous trouvent sur Google et vous appellent en un geste.',
  },
];

export const inclus = [
  { icone: 'photo', titre: 'Vos photos', texte: 'Votre vitrine, vos produits, votre équipe.' },
  { icone: 'liste', titre: 'Services ou carte', texte: 'Vos prestations, vos tarifs, votre menu.' },
  { icone: 'horloge', titre: 'Horaires', texte: 'Toujours à jour, jours fériés compris.' },
  { icone: 'carte', titre: 'Plan d’accès', texte: 'L’adresse et l’itinéraire en un geste.' },
  { icone: 'telephone', titre: 'Appel direct', texte: 'Un bouton pour vous appeler depuis le téléphone.' },
  { icone: 'message', titre: 'Contact ou devis', texte: 'Un formulaire simple, reçu par e-mail.' },
  { icone: 'lien', titre: 'Instagram et réservation', texte: 'Vos liens existants, mis en avant.' },
  { icone: 'recherche', titre: 'Trouvé sur Google', texte: 'Votre nom, votre métier, votre quartier.' },
  { icone: 'globe', titre: 'Nom de domaine et hébergement', texte: 'Votre adresse web, sans rien à gérer.' },
];

export const faq = [
  {
    question: 'Je n’y connais rien en informatique. C’est un problème ?',
    reponse:
      'Pas du tout. Vous n’avez rien à installer ni à apprendre. Nous faisons tout : textes, photos, mise en ligne. Vous validez simplement sur votre téléphone.',
  },
  {
    question: 'Et si je veux arrêter ?',
    reponse:
      'L’abonnement est sans engagement. Vous arrêtez quand vous voulez, par simple message, sans frais. Le nom de domaine reste à votre nom.',
  },
  {
    question: 'J’ai déjà Instagram. Ça ne suffit pas ?',
    reponse:
      'Instagram est utile pour ceux qui vous connaissent déjà. Mais quand quelqu’un cherche « fleuriste Paris 16 » sur Google, il voit d’abord les commerces qui ont un site. Votre site renvoie aussi vers votre Instagram.',
  },
  {
    question: 'Qui s’occupe des modifications ?',
    reponse:
      'Nous. Nouveaux horaires, nouvelle photo, fermeture pour congés : envoyez un message ou appelez, c’est fait. Les petites modifications sont comprises dans l’abonnement.',
  },
  {
    question: 'Combien de temps ça me prend ?',
    reponse:
      'Une vingtaine de minutes en tout : un premier échange, l’envoi de quelques photos, puis la validation de la maquette. Nous pouvons aussi passer prendre les photos à la boutique.',
  },
];

/**
 * Exemples par métier — tous FICTIFS, étiquetés « Exemple » sur le site.
 * Pour en ajouter un : créez une maquette dans src/components/maquettes/ et ajoutez-la ici
 * et dans src/components/Exemples.astro.
 */
export const exemples = [
  { id: 'fleuriste', metier: 'Fleuriste', nom: 'Ancolie', resume: 'bouquets du jour, livraison, horaires' },
  { id: 'traiteur', metier: 'Traiteur', nom: 'Table Haute', resume: 'menus de réception, demande de devis' },
  { id: 'galerie', metier: 'Galerie d’art', nom: 'Galerie Onze', resume: 'exposition en cours, artistes, visite' },
  { id: 'institut', metier: 'Institut de beauté', nom: 'Rive Douce', resume: 'soins, tarifs, réservation' },
  { id: 'garage', metier: 'Garage', nom: 'Atelier Méca 92', resume: 'entretien, devis, appel direct' },
  { id: 'restaurant', metier: 'Restaurant', nom: 'Le Comptoir Vert', resume: 'carte, privatisation, réservation' },
] as const;
