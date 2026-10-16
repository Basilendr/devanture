import { animate } from 'motion';
import { RESSORT, FONDU, mouvementReduit } from './mouvement';

type Regle = (valeur: string, champ: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => string;

const chiffres = (v: string) => v.replace(/[\s.\-()]/g, '');

/** Messages en clair, affichés sous chaque champ. Chaîne vide = champ valide. */
const regles: Record<string, Regle> = {
  commerce: (v) => (v.trim().length < 2 ? 'Indiquez le nom de votre commerce.' : ''),
  metier: (v) => (!v ? 'Choisissez votre métier.' : ''),
  quartier: (v) => (!v ? 'Choisissez votre quartier.' : ''),
  telephone: (v) => {
    if (!v.trim()) return 'Indiquez un numéro pour que l’on puisse vous rappeler.';
    return /^(?:\+33|0033|0)[1-9]\d{8}$/.test(chiffres(v))
      ? ''
      : 'Vérifiez le numéro : 10 chiffres, par exemple 06 12 34 56 78.';
  },
  email: (v) =>
    v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
      ? 'Vérifiez l’adresse e-mail (par exemple nom@exemple.fr), ou laissez ce champ vide.'
      : '',
  consentement: (_v, c) =>
    (c as HTMLInputElement).checked ? '' : 'Cochez cette case pour que l’on puisse vous recontacter.',
};

export function brancherFormulaires() {
  document.querySelectorAll<HTMLFormElement>('[data-formulaire]').forEach(brancher);
}

function brancher(form: HTMLFormElement) {
  form.noValidate = true; // on remplace les bulles du navigateur par des messages sous les champs
  const zone = form.parentElement!;
  const confirmation = zone.querySelector<HTMLElement>('[data-confirmation]')!;
  const erreurGlobale = form.querySelector<HTMLElement>('[data-erreur-globale]')!;
  const bouton = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const libelle = bouton.querySelector<HTMLElement>('[data-libelle]')!;
  const touches = new Set<string>();

  const champs = () =>
    Object.keys(regles)
      .map((nom) => form.elements.namedItem(nom) as HTMLInputElement | null)
      .filter((c): c is HTMLInputElement => !!c);

  function verifier(champ: HTMLInputElement) {
    const message = regles[champ.name]?.(champ.value, champ) ?? '';
    const sortie = form.querySelector<HTMLElement>(`#${champ.id}-msg`);
    champ.setAttribute('aria-invalid', String(!!message));
    if (sortie && sortie.textContent !== message) sortie.textContent = message;
    return !message;
  }

  champs().forEach((champ) => {
    // Première vérification en quittant le champ, puis à chaque frappe
    champ.addEventListener('blur', () => {
      if (champ.value || champ.type === 'checkbox' || touches.has(champ.name)) {
        touches.add(champ.name);
        verifier(champ);
      }
    });
    const evenement = champ.tagName === 'SELECT' || champ.type === 'checkbox' ? 'change' : 'input';
    champ.addEventListener(evenement, () => {
      if (champ.tagName === 'SELECT' || champ.type === 'checkbox') touches.add(champ.name);
      if (touches.has(champ.name)) verifier(champ);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erreurGlobale.textContent = '';
    const invalides = champs().filter((c) => {
      touches.add(c.name);
      return !verifier(c);
    });
    if (invalides.length) {
      invalides[0].focus();
      return;
    }

    bouton.setAttribute('aria-busy', 'true');
    libelle.textContent = 'Envoi en cours…';

    try {
      if (form.action.includes('%5B') || form.action.includes('[')) {
        throw new Error('Adresse du formulaire non configurée');
      }
      const reponse = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!reponse.ok) throw new Error(String(reponse.status));
      afficherConfirmation();
    } catch {
      const tel = document.querySelector<HTMLAnchorElement>('a[href^="tel:"]')?.textContent?.trim();
      erreurGlobale.textContent = `L’envoi n’a pas abouti. Réessayez dans un instant${
        tel ? `, ou appelez-nous au ${tel}` : ''
      }.`;
      bouton.removeAttribute('aria-busy');
      libelle.textContent = 'Recevoir ma maquette gratuite';
    }
  });

  function afficherConfirmation() {
    const tel = (form.elements.namedItem('telephone') as HTMLInputElement).value.trim();
    const cible = confirmation.querySelector('[data-confirmation-tel]');
    if (cible) cible.textContent = `au ${tel}`;
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector<HTMLElement>('[data-confirmation-titre]')?.focus();
    if (mouvementReduit()) {
      animate(confirmation, { opacity: [0, 1] }, FONDU);
    } else {
      animate(confirmation, { opacity: [0, 1], y: [12, 0] }, RESSORT);
    }
  }
}
