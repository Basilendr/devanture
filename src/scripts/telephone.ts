import { animate } from 'motion';
import { SuiviVitesse, elastique, elastiqueInverse, mouvementReduit, projeter, DECELERATION } from './mouvement';

type Controle = { stop: () => void };

/**
 * Écran de téléphone défilable.
 * - Doigt : défilement natif (élan et rebond du système, le plus naturel sur iPhone/Android).
 * - Souris/stylet : glisser 1:1 depuis le point saisi, élastique aux bords, lancer avec élan
 *   projeté (décélération 0,998) puis léger rebond aux extrémités. Interruptible à tout moment.
 */
export function brancherTelephones() {
  document.querySelectorAll<HTMLElement>('[data-telephone]').forEach(brancher);
}

function brancher(racine: HTMLElement) {
  const ecran = racine.querySelector<HTMLElement>('[data-ecran]')!;
  const contenu = racine.querySelector<HTMLElement>('[data-contenu]')!;
  const suivi = new SuiviVitesse();

  let y = 0; // position affichée (peut dépasser les bords pendant l'élastique)
  let anim: Controle | null = null;
  let saisie: { id: number; debutPointeur: number; debutY: number } | null = null;

  const max = () => Math.max(0, ecran.scrollHeight - ecran.clientHeight);
  const borne = (v: number) => Math.min(max(), Math.max(0, v));

  function afficher(v: number) {
    y = v;
    const b = borne(v);
    ecran.scrollTop = b;
    const depassement = v - b;
    contenu.style.transform = depassement ? `translateY(${-depassement}px)` : '';
  }

  function arreter() {
    anim?.stop();
    anim = null;
  }

  // Molette, clavier, doigt : le système défile, on se resynchronise simplement.
  ecran.addEventListener('scroll', () => {
    if (!saisie && !anim) y = ecran.scrollTop;
  });
  ecran.addEventListener('wheel', arreter, { passive: true });

  ecran.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    arreter(); // on rattrape l'animation en cours, depuis la position affichée
    e.preventDefault();
    ecran.setPointerCapture(e.pointerId);
    ecran.toggleAttribute('data-saisi', true);
    // Si on saisit l'écran en plein rebond, on repart de la position « brute » équivalente
    const h = ecran.clientHeight;
    const b = borne(y);
    const brut = b + elastiqueInverse(y - b, h);
    saisie = { id: e.pointerId, debutPointeur: e.clientY, debutY: brut };
    suivi.vider();
    suivi.ajouter(-e.clientY);
  });

  ecran.addEventListener('pointermove', (e) => {
    if (!saisie || e.pointerId !== saisie.id) return;
    const brut = saisie.debutY - (e.clientY - saisie.debutPointeur);
    const b = borne(brut);
    afficher(b + elastique(brut - b, ecran.clientHeight));
    suivi.ajouter(-e.clientY);
  });

  function relacher(e: PointerEvent) {
    if (!saisie || e.pointerId !== saisie.id) return;
    saisie = null;
    ecran.toggleAttribute('data-saisi', false);
    const vitesse = suivi.vitesse();

    if (mouvementReduit()) {
      afficher(borne(y)); // pas d'élan ni de rebond
      return;
    }

    // Motion ignore une animation dont le départ et l'arrivée sont égaux : on lui donne
    // le point projeté (ou le bord, si l'on relâche dans l'élastique). L'inertie recalcule
    // de toute façon son arrivée à partir de la vitesse.
    const projete = y + projeter(vitesse);
    anim = animate(y, projete !== y ? projete : borne(y), {
      type: 'inertia',
      velocity: vitesse,
      // Même projection qu'Apple : arrivée = position + (v/1000)·d/(1−d)
      power: DECELERATION / (1 - DECELERATION) / 1000,
      timeConstant: -1 / Math.log(DECELERATION),
      min: 0,
      max: max(),
      // Rebond aux bords ≈ ressort amorti à 0,8 (rebond 0,2)
      bounceStiffness: 400,
      bounceDamping: 32,
      restDelta: 0.5,
      onUpdate: afficher,
      onComplete: () => {
        anim = null;
      },
    });
  }

  ecran.addEventListener('pointerup', relacher);
  ecran.addEventListener('pointercancel', relacher);
  ecran.addEventListener('lostpointercapture', (e) => relacher(e as PointerEvent));
}
