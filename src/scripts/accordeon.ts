import { animate } from 'motion';
import { RESSORT, FONDU, mouvementReduit } from './mouvement';

type Controle = { stop: () => void };

/**
 * Accordéon animé uniquement avec transform et opacity (technique FLIP) :
 * la réponse se déplie depuis sa question et se replie par le même chemin ;
 * les éléments suivants glissent vers leur nouvelle place au lieu de sauter.
 * Interruptible : chaque mesure part de la position réellement affichée.
 * Sans JavaScript, les <details> natifs fonctionnent normalement.
 */
export function brancherAccordeons() {
  document.querySelectorAll<HTMLElement>('[data-accordeon]').forEach(brancher);
}

function brancher(liste: HTMLElement) {
  const elements = Array.from(liste.querySelectorAll<HTMLDetailsElement>('details'));
  const encours = new Map<Element, Controle>();

  /** Tout ce qui se trouve sous la question cliquée et doit glisser. */
  function suivants(el: HTMLDetailsElement): HTMLElement[] {
    const apres = elements.slice(elements.indexOf(el) + 1);
    const section = liste.closest('section');
    const freres: HTMLElement[] = [];
    let s = section?.nextElementSibling as HTMLElement | null;
    while (s) {
      freres.push(s);
      s = s.nextElementSibling as HTMLElement | null;
    }
    const pied = document.querySelector<HTMLElement>('body > footer');
    return [...apres, ...freres, ...(pied ? [pied] : [])];
  }

  function stopper(el: Element) {
    encours.get(el)?.stop();
    encours.delete(el);
  }

  function glisser(cibles: HTMLElement[], avant: Map<HTMLElement, number>) {
    cibles.forEach((c) => {
      const delta = (avant.get(c) ?? 0) - c.getBoundingClientRect().top;
      if (Math.abs(delta) < 0.5) {
        c.style.transform = '';
        return;
      }
      c.style.transform = `translateY(${delta}px)`;
      const a = animate(c, { y: [delta, 0] }, RESSORT);
      encours.set(c, a);
      a.then(() => {
        if (encours.get(c) === a) {
          c.style.transform = '';
          encours.delete(c);
        }
      });
    });
  }

  elements.forEach((el) => {
    const question = el.querySelector('summary')!;
    const reponse = el.querySelector<HTMLElement>('.faq__reponse')!;
    let ouvert = el.open;

    question.addEventListener('click', (e) => {
      e.preventDefault();
      ouvert = !ouvert;
      const cibles = suivants(el);

      if (mouvementReduit()) {
        el.open = ouvert;
        reponse.style.cssText = '';
        if (ouvert) animate(reponse, { opacity: [0, 1] }, FONDU);
        return;
      }

      // 1. Positions affichées actuelles (valeurs de présentation, animations comprises)
      const avant = new Map(cibles.map((c) => [c, c.getBoundingClientRect().top]));
      const opaciteAffichee = Number(getComputedStyle(reponse).opacity);
      cibles.forEach((c) => {
        stopper(c);
        c.style.transform = '';
      });
      stopper(reponse);

      if (ouvert) {
        // 2. Nouvelle mise en page : réponse dans le flux
        el.open = true;
        reponse.style.cssText = '';
        const depart = el.dataset.ferme === 'en-cours' ? opaciteAffichee : 0;
        delete el.dataset.ferme;
        glisser(cibles, avant);
        const a = animate(reponse, { opacity: [depart, 1], y: [-8, 0], scale: [0.98, 1] }, RESSORT);
        encours.set(reponse, a);
      } else {
        // 2. La réponse sort du flux (mais reste visible le temps de se replier)
        const h = reponse.offsetTop;
        reponse.style.cssText = `position:absolute;left:0;right:0;top:${h}px;`;
        el.dataset.ferme = 'en-cours';
        glisser(cibles, avant);
        const a = animate(reponse, { opacity: [opaciteAffichee, 0], y: [0, -8], scale: [1, 0.98] }, RESSORT);
        encours.set(reponse, a);
        a.then(() => {
          if (encours.get(reponse) !== a) return; // rouverte entre-temps
          encours.delete(reponse);
          el.open = false;
          delete el.dataset.ferme;
          reponse.style.cssText = '';
        });
      }
    });
  });
}
