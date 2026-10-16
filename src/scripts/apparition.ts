import { animate, inView } from 'motion';
import { RESSORT, FONDU, mouvementReduit } from './mouvement';

/** Apparitions discrètes au défilement : opacité + 12px, une seule fois. */
export function lancerApparitions() {
  const elements = document.querySelectorAll<HTMLElement>('[data-apparition]');
  elements.forEach((el) => {
    inView(
      el,
      () => {
        const delai = Number(el.dataset.apparition || 0) * 0.06;
        if (mouvementReduit()) {
          animate(el, { opacity: [0, 1] }, { ...FONDU, delay: delai });
        } else {
          animate(el, { opacity: [0, 1], y: [12, 0] }, { ...RESSORT, visualDuration: 0.6, delay: delai });
        }
        // Pas de fonction de sortie : on n'anime qu'une fois
      },
      { margin: '0px 0px -10% 0px' },
    );
  });
}
