// ─────────────────────────────────────────────────────────────────────────────
//  Questionnaire « Recevoir ma maquette gratuite ».
//  Chaque réponse arrive dans UN SEUL e-mail, sur l'adresse du site (site.email).
//  Le « nom » de chaque question est le libellé affiché dans l'e-mail reçu.
//  Pour ajouter une question : ajoutez un objet dans l'étape voulue, rien d'autre à faire.
// ─────────────────────────────────────────────────────────────────────────────
import { metiers } from './site';

export type TypeQuestion = 'texte' | 'tel' | 'email' | 'url' | 'zone' | 'liste' | 'choix' | 'cases';

export interface Question {
  nom: string; // libellé dans l'e-mail
  label: string; // question affichée
  type: TypeQuestion;
  requis?: boolean;
  options?: string[];
  aide?: string;
  exemple?: string; // placeholder
  autocomplete?: string;
  large?: boolean; // occupe toute la largeur (sinon deux par ligne sur grand écran)
}

export interface Etape {
  titre: string;
  intro: string;
  questions: Question[];
}

export const etapesQuestionnaire: Etape[] = [
  {
    titre: 'Votre commerce',
    intro: 'Pour commencer, présentez-nous votre commerce.',
    questions: [
      { nom: 'Nom du commerce', label: 'Nom du commerce', type: 'texte', requis: true, autocomplete: 'organization', large: true },
      { nom: 'Métier', label: 'Métier', type: 'liste', requis: true, options: metiers },
      { nom: 'Ville ou arrondissement', label: 'Ville ou arrondissement', type: 'texte', requis: true, exemple: 'Paris 16e, Puteaux…', autocomplete: 'address-level2' },
      { nom: 'Adresse du commerce', label: 'Adresse du commerce', type: 'texte', exemple: 'Numéro et rue', autocomplete: 'street-address', large: true },
      {
        nom: 'En une phrase',
        label: 'En une phrase, qu’est-ce qui rend votre commerce unique ?',
        type: 'zone',
        exemple: 'Fleurs de saison, livraison le jour même…',
        aide: 'Facultatif, mais cela nous aide beaucoup.',
        large: true,
      },
    ],
  },
  {
    titre: 'Aujourd’hui',
    intro: 'Où vos clients vous trouvent-ils aujourd’hui ?',
    questions: [
      {
        nom: 'Site actuel',
        label: 'Avez-vous déjà un site ?',
        type: 'choix',
        requis: true,
        options: ['Non, aucun', 'Oui, mais il est ancien', 'Oui, et j’en veux un nouveau'],
        large: true,
      },
      {
        nom: 'Présence en ligne',
        label: 'Où êtes-vous déjà présent ?',
        type: 'cases',
        options: ['Fiche Google (Maps)', 'Instagram', 'Facebook', 'TikTok', 'Pages Jaunes', 'Plateforme de réservation', 'Nulle part pour l’instant'],
        aide: 'Plusieurs réponses possibles.',
        large: true,
      },
      { nom: 'Liens existants', label: 'Vos liens (site, Instagram, fiche Google…)', type: 'zone', exemple: 'instagram.com/moncommerce', large: true },
      {
        nom: 'Clients',
        label: 'Qui sont vos clients, surtout ?',
        type: 'cases',
        options: ['Habitants du quartier', 'Salariés des bureaux', 'Touristes', 'Professionnels / entreprises', 'Clients qui viennent de loin'],
        aide: 'Plusieurs réponses possibles.',
        large: true,
      },
    ],
  },
  {
    titre: 'Votre site',
    intro: 'Qu’attendez-vous de votre site ?',
    questions: [
      {
        nom: 'Objectif principal',
        label: 'Le plus important pour vous',
        type: 'choix',
        requis: true,
        options: [
          'Être trouvé sur Google',
          'Recevoir plus d’appels',
          'Recevoir des réservations',
          'Recevoir des demandes de devis',
          'Montrer mes produits et mon savoir-faire',
          'Vendre en ligne',
        ],
        large: true,
      },
      {
        nom: 'Contenu souhaité',
        label: 'Ce que vous voulez sur votre site',
        type: 'cases',
        options: [
          'Photos du commerce et des produits',
          'Carte, menu ou liste des services',
          'Tarifs',
          'Horaires',
          'Plan d’accès',
          'Bouton d’appel direct',
          'Formulaire de contact ou de devis',
          'Réservation en ligne',
          'Liens Instagram / réseaux',
          'Avis Google existants',
          'Version en anglais',
        ],
        aide: 'Plusieurs réponses possibles.',
        large: true,
      },
      {
        nom: 'Nombre de pages',
        label: 'Combien de pages imaginez-vous ?',
        type: 'choix',
        options: ['Une seule page suffit', '2 à 4 pages', 'Plus de 4 pages', 'Je ne sais pas'],
        large: true,
      },
    ],
  },
  {
    titre: 'Votre style',
    intro: 'À quoi votre site devrait-il ressembler ?',
    questions: [
      {
        nom: 'Ambiance',
        label: 'L’ambiance qui vous ressemble',
        type: 'choix',
        requis: true,
        options: ['Sobre et élégant', 'Chaleureux et artisanal', 'Moderne et épuré', 'Haut de gamme', 'Coloré et joyeux', 'Je vous laisse proposer'],
        large: true,
      },
      { nom: 'Couleurs', label: 'Des couleurs à utiliser ou à éviter ?', type: 'texte', exemple: 'Vert et blanc, comme ma devanture', large: true },
      { nom: 'Logo', label: 'Avez-vous un logo ?', type: 'choix', options: ['Oui', 'Non', 'Non, et j’aimerais en avoir un'] },
      {
        nom: 'Photos',
        label: 'Et des photos ?',
        type: 'choix',
        options: ['Oui, de bonne qualité', 'Quelques photos au téléphone', 'Non, venez les prendre'],
      },
      { nom: 'Site qui vous plaît', label: 'Un site qui vous plaît (même d’un autre métier) ?', type: 'texte', exemple: 'Adresse du site', large: true },
    ],
  },
  {
    titre: 'Vos coordonnées',
    intro: 'Dernière étape : où vous joindre pour la maquette ?',
    questions: [
      { nom: 'Prénom et nom', label: 'Prénom et nom', type: 'texte', requis: true, autocomplete: 'name' },
      { nom: 'Téléphone', label: 'Téléphone', type: 'tel', requis: true, exemple: '06 12 34 56 78', autocomplete: 'tel' },
      { nom: 'E-mail', label: 'E-mail', type: 'email', autocomplete: 'email', aide: 'Facultatif, pour recevoir la maquette par e-mail.' },
      {
        nom: 'Meilleur moment pour appeler',
        label: 'Quand vous appeler ?',
        type: 'liste',
        options: ['Peu importe', 'Le matin', 'À l’heure du déjeuner', 'L’après-midi', 'En fin de journée'],
      },
      {
        nom: 'Délai souhaité',
        label: 'Pour quand aimeriez-vous votre site ?',
        type: 'choix',
        options: ['Dès que possible', 'Dans le mois', 'Pas pressé'],
      },
      {
        nom: 'Formule envisagée',
        label: 'Quelle formule vous intéresse ?',
        type: 'choix',
        options: ['Abonnement mensuel', 'Achat unique', 'Je ne sais pas encore'],
      },
      { nom: 'Message', label: 'Autre chose à nous dire ?', type: 'zone', exemple: 'Une question, une précision…', large: true },
    ],
  },
];
