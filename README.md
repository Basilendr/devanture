# Devanture

Site vitrine de Devanture : des sites web pour les commerces indépendants (Puteaux, La Défense,
Paris 8e et 16e). Promesse : « Votre devanture, aussi sur Google. »

Une seule page longue, plus `/mentions-legales` et `/confidentialite`. Site statique construit avec
[Astro](https://astro.build), animations avec [Motion](https://motion.dev). Hébergement sur Vercel.

## Modifier le site

**Presque tout se change dans un seul fichier : [`src/data/site.ts`](src/data/site.ts).**

| Vous voulez changer… | Où |
|---|---|
| Prix, téléphone, e-mail, zones, délai | `src/data/site.ts`, en haut (`site`) |
| Mentions légales (nom, SIRET, adresse, statut) | `src/data/site.ts` → `site.editeur` |
| Étapes, « Ce qui est inclus », questions fréquentes | `src/data/site.ts` → `etapes`, `inclus`, `faq` |
| Liste des métiers du formulaire | `src/data/site.ts` → `metiers` |
| Contenu des exemples (noms, accroches, prix fictifs, couleurs) | `src/data/maquettes.ts` |
| Ordre et libellés des cartes d'exemples | `src/data/site.ts` → `exemples` |
| Couleurs, espacements, arrondis, ombres du site | `src/styles/global.css`, section 1 (et 2 pour le mode sombre) |
| Domaine du site | `astro.config.mjs` → `DOMAINE` |
| Textes des pages légales | `src/pages/mentions-legales.astro`, `src/pages/confidentialite.astro` |

### Valeurs à remplacer avant la mise en ligne

Cherchez `[` dans le projet : chaque valeur entre crochets est à remplir.

- `[PRIX]` ×3 : abonnement mensuel, achat unique, hébergement annuel de l'achat unique
- `[TÉLÉPHONE]` ×2 : affiché (`06 12 34 56 78`) et pour le lien d'appel (`+33612345678`)
- `[EMAIL]`
- `[NOM PRÉNOM]`, `[STATUT JURIDIQUE]`, `[SIRET]`, `[ADRESSE]`
- `[DURÉE]` : durée de conservation des demandes (ex. « 3 ans après notre dernier échange »)
- `[ID_FORMSPREE]` : voir « Formulaire » ci-dessous
- `[DOMAINE]` dans `astro.config.mjs`
- `[DATE]` et la mention de TVA dans les deux pages légales

Tant qu'une valeur n'est pas remplie, elle n'est **pas** envoyée à Google dans les données
structurées (pas de faux numéro ni de faux prix publiés).

### Formulaire

Le formulaire est envoyé à [Formspree](https://formspree.io) (gratuit jusqu'à 50 demandes par mois),
qui vous transfère chaque demande par e-mail.

1. Créez un compte sur formspree.io, puis « New form ».
2. Copiez l'identifiant du formulaire (la fin de l'adresse, ex. `xyzabcd`).
3. Collez-le dans `src/data/site.ts` à la place de `[ID_FORMSPREE]`.

Un champ piège invisible (`_gotcha`) bloque les robots. Tant que l'identifiant n'est pas rempli,
l'envoi affiche un message d'erreur invitant à téléphoner.

## Travailler en local

Il faut [Node.js](https://nodejs.org) 22 ou plus.

```bash
npm install
npm run dev        # site en direct sur http://localhost:4321, se met à jour à chaque enregistrement
```

## Mettre en ligne sur Vercel (3 étapes)

1. Mettez le dossier sur GitHub (nouveau dépôt, puis `git push`).
2. Sur [vercel.com](https://vercel.com) : « Add New → Project », choisissez le dépôt. Vercel reconnaît
   Astro tout seul : cliquez « Deploy ».
3. Dans « Settings → Domains », ajoutez votre nom de domaine, puis reportez-le dans
   `astro.config.mjs` (`DOMAINE`) et poussez la modification.

Ensuite, chaque `git push` sur `main` remet le site à jour automatiquement.

## Vérifications

```bash
npm run check:visuel    # captures 375/768/1440 px clair et sombre, tests au doigt, mouvement réduit
npm run check:vitesse   # Lighthouse mobile (performance, accessibilité, bonnes pratiques, référencement)
```

Les captures sont rangées dans `captures/` (non versionné). `check:visuel` régénère aussi l'image de
partage (`public/partage.png`) et l'icône d'écran d'accueil.

Dernier résultat Lighthouse mobile : performance 99, accessibilité 100, bonnes pratiques 100,
référencement 100.

## Organisation du code

```
src/
  data/site.ts            textes, prix, contacts, FAQ, exemples
  data/maquettes.ts       contenu des faux sites d'exemple (fictifs)
  styles/global.css       jetons (couleurs, espacements…), mode sombre, boutons, accessibilité
  layouts/                Base (en-tête, pied, référencement), Legal (pages légales)
  components/             Nav, Hero, Telephone, Probleme, Etapes, Exemples, Inclus, Tarifs, FAQ,
                          FormulaireMaquette, Pied, Icone, maquettes/
  scripts/                mouvement (ressorts, élan, élastique), carrousel, telephone, accordeon,
                          formulaire, apparition
  pages/                  index, mentions-legales, confidentialite, 404, robots.txt, sitemap.xml
scripts/                  verifier.mjs, lighthouse.mjs, serveur.mjs (outils de vérification)
```

### Principes de mouvement

- Ressorts sans rebond par défaut (`bounce: 0`, `visualDuration: 0.35`), léger rebond (`0.2`)
  seulement après un lancer.
- Toute animation est interruptible et repart de la position affichée.
- Carrousel : suit le doigt 1:1, vise la carte la plus proche du point projeté par l'élan
  (`position + (v/1000)·0.998/(1−0.998)`), résistance élastique aux bords.
- Écran du téléphone : défilement natif au doigt ; à la souris, glisser + lancer avec la même
  projection et un rebond aux extrémités.
- Accordéon : n'anime que `transform` et `opacity` (technique FLIP), s'ouvre et se referme par le
  même chemin.
- `prefers-reduced-motion` : simples fondus. `prefers-reduced-transparency` et
  `prefers-contrast: more` : fonds pleins et bordures nettes.

### Interdits (à garder)

Pas de faux avis, faux témoignages, faux logos de clients ni compteurs inventés. Les exemples sont
fictifs et toujours étiquetés « Exemple ».
