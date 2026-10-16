import { animate } from 'motion';
import { RESSORT, RESSORT_ELAN, SuiviVitesse, elastique, elastiqueInverse, mouvementReduit, projeter } from './mouvement';

type Controle = { stop: () => void };

/**
 * Carrousel horizontal :
 * - suit le doigt 1:1 depuis le point saisi (Pointer Events + capture, touch-action: pan-y) ;
 * - au lâcher, garde la vitesse du doigt et vise la carte la plus proche du point projeté par l'élan ;
 * - résistance élastique aux extrémités ; léger rebond après un lancer seulement ;
 * - interruptible : on peut rattraper la piste en mouvement, elle repart de la position affichée.
 */
export function brancherCarrousels() {
  document.querySelectorAll<HTMLElement>('[data-carrousel]').forEach(brancher);
}

function brancher(vue: HTMLElement) {
  const section = vue.closest('section')!;
  const piste = vue.querySelector<HTMLElement>('[data-piste]')!;
  const cartes = Array.from(piste.children) as HTMLElement[];
  const precedent = section.querySelector<HTMLButtonElement>('[data-precedent]');
  const suivant = section.querySelector<HTMLButtonElement>('[data-suivant]');
  const statut = section.querySelector<HTMLElement>('[data-statut]');
  const suivi = new SuiviVitesse();

  let x = 0; // translation affichée
  let anim: Controle | null = null;
  let crans: number[] = [];
  let saisie: { id: number; debutPointeur: number; debutX: number; bouge: boolean } | null = null;

  const minX = () => crans[crans.length - 1] ?? 0;

  function mesurer() {
    const debut = cartes[0].offsetLeft;
    const min = Math.min(0, vue.clientWidth - piste.offsetWidth);
    // Une position par carte, sans dépasser la fin de la piste, sans doublon
    crans = [...new Set(cartes.map((c) => Math.max(min, -(c.offsetLeft - debut))))];
  }

  function afficher(v: number) {
    x = v;
    piste.style.transform = `translate3d(${v}px,0,0)`;
  }

  const indexProche = (pos: number) =>
    crans.reduce((meilleur, c, i) => (Math.abs(c - pos) < Math.abs(crans[meilleur] - pos) ? i : meilleur), 0);

  function majBoutons(index: number) {
    if (precedent) precedent.disabled = index <= 0;
    if (suivant) suivant.disabled = index >= crans.length - 1;
  }

  function annoncer(index: number) {
    if (statut) statut.textContent = `Exemple ${index + 1} sur ${cartes.length}`;
  }

  function aller(index: number, vitesse = 0, lance = false) {
    anim?.stop();
    const i = Math.max(0, Math.min(crans.length - 1, index));
    const cible = crans[i];
    majBoutons(i);
    if (mouvementReduit()) {
      // Pas de glissement : un simple fondu
      piste.style.opacity = '0';
      afficher(cible);
      anim = animate(piste, { opacity: [0, 1] }, { duration: 0.2 });
    } else {
      anim = animate(x, cible, {
        ...(lance ? RESSORT_ELAN : RESSORT),
        velocity: vitesse,
        onUpdate: afficher,
      });
    }
    anim.then?.(() => annoncer(i));
  }

  // ── Glisser ──────────────────────────────────────────────────────────────
  vue.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    anim?.stop(); // rattrape la piste là où elle est affichée
    anim = null;
    const mn = minX();
    const brut = x > 0 ? elastiqueInverse(x, vue.clientWidth) : x < mn ? mn + elastiqueInverse(x - mn, vue.clientWidth) : x;
    saisie = { id: e.pointerId, debutPointeur: e.clientX, debutX: brut, bouge: false };
    suivi.vider();
    suivi.ajouter(e.clientX);
    vue.setPointerCapture(e.pointerId);
    vue.toggleAttribute('data-saisi', true);
  });

  vue.addEventListener('pointermove', (e) => {
    if (!saisie || e.pointerId !== saisie.id) return;
    const dx = e.clientX - saisie.debutPointeur;
    if (!saisie.bouge && Math.abs(dx) < 4) return;
    saisie.bouge = true;
    const brut = saisie.debutX + dx;
    const mn = minX();
    const w = vue.clientWidth;
    afficher(brut > 0 ? elastique(brut, w) : brut < mn ? mn + elastique(brut - mn, w) : brut);
    suivi.ajouter(e.clientX);
  });

  function relacher(e: PointerEvent) {
    if (!saisie || e.pointerId !== saisie.id) return;
    saisie = null;
    vue.toggleAttribute('data-saisi', false);
    const v = suivi.vitesse();
    // Point d'arrivée naturel de l'élan, puis carte la plus proche de ce point
    const projete = x + projeter(v);
    aller(indexProche(projete), v, Math.abs(v) > 50);
  }

  vue.addEventListener('pointerup', relacher);
  vue.addEventListener('pointercancel', relacher);
  vue.addEventListener('lostpointercapture', (e) => relacher(e as PointerEvent));

  // ── Pavé tactile (glissement horizontal à deux doigts) ───────────────────
  let attente: number | undefined;
  vue.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      anim?.stop();
      anim = null;
      const mn = minX();
      afficher(Math.min(0, Math.max(mn, x - e.deltaX)));
      clearTimeout(attente);
      attente = window.setTimeout(() => aller(indexProche(x)), 140);
    },
    { passive: false },
  );

  // ── Boutons et clavier ───────────────────────────────────────────────────
  precedent?.addEventListener('click', () => aller(indexProche(x) - 1));
  suivant?.addEventListener('click', () => aller(indexProche(x) + 1));
  vue.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') aller(indexProche(x) + 1);
    else if (e.key === 'ArrowLeft') aller(indexProche(x) - 1);
    else if (e.key === 'Home') aller(0);
    else if (e.key === 'End') aller(crans.length - 1);
    else return;
    e.preventDefault();
  });

  // ── Mise en place et redimensionnement ───────────────────────────────────
  mesurer();
  majBoutons(0);
  new ResizeObserver(() => {
    const i = indexProche(x);
    mesurer();
    anim?.stop();
    afficher(crans[Math.min(i, crans.length - 1)]);
    majBoutons(indexProche(x));
  }).observe(vue);
}
