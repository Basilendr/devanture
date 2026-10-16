// Outils de mouvement partagés : ressorts, projection d'élan, élastique, suivi de vitesse.
// Principes : on part toujours de la valeur affichée, on hérite de la vitesse du doigt,
// on ne bloque jamais l'interaction pendant une animation.

/** L'utilisateur a-t-il demandé moins de mouvement ? (relu à chaque appel : le réglage peut changer) */
export const mouvementReduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Ressort par défaut : amortissement critique, aucun rebond. */
export const RESSORT = { type: 'spring', bounce: 0, visualDuration: 0.35 } as const;

/** Après un lancer seulement : un léger rebond. */
export const RESSORT_ELAN = { type: 'spring', bounce: 0.2, visualDuration: 0.35 } as const;

/** Fondu simple, utilisé à la place des ressorts en mouvement réduit. */
export const FONDU = { duration: 0.2, ease: 'easeOut' } as const;

/** Taux de décélération façon défilement Apple (par milliseconde). */
export const DECELERATION = 0.998;

/**
 * Distance parcourue par l'élan : position + projeter(v) = point d'arrivée naturel.
 * Formule d'Apple (Designing Fluid Interfaces) : (v/1000)·d/(1−d).
 */
export function projeter(vitesse: number, d = DECELERATION) {
  return ((vitesse / 1000) * d) / (1 - d);
}

/** Résistance élastique : plus on dépasse, moins l'élément suit. */
export function elastique(depassement: number, dimension: number, c = 0.55) {
  return (depassement * dimension * c) / (dimension + c * Math.abs(depassement));
}

/** Retrouve le dépassement « brut » à partir d'une position élastique affichée (inverse de elastique). */
export function elastiqueInverse(affiche: number, dimension: number, c = 0.55) {
  const a = Math.abs(affiche);
  const brut = (a * dimension) / (c * (dimension - a));
  return Math.sign(affiche) * (Number.isFinite(brut) ? brut : a);
}

/** Mémorise les derniers déplacements du pointeur pour calculer la vitesse au lâcher (px/s). */
export class SuiviVitesse {
  private points: { v: number; t: number }[] = [];

  ajouter(valeur: number, t = performance.now()) {
    this.points.push({ v: valeur, t });
    // On ne garde que les 100 dernières millisecondes
    while (this.points.length > 2 && t - this.points[0].t > 100) this.points.shift();
  }

  vitesse() {
    const p = this.points;
    if (p.length < 2) return 0;
    const premier = p[0];
    const dernier = p[p.length - 1];
    // Doigt immobile avant le lâcher : pas d'élan
    if (performance.now() - dernier.t > 60) return 0;
    const dt = dernier.t - premier.t;
    return dt > 0 ? ((dernier.v - premier.v) / dt) * 1000 : 0;
  }

  vider() {
    this.points = [];
  }
}

/** Lit la translation actuellement affichée d'un élément (valeur de présentation). */
export function translationAffichee(el: Element) {
  const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return { x: m.m41, y: m.m42 };
}
