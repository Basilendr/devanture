import { animate } from 'motion';
import { RESSORT, FONDU, mouvementReduit } from './mouvement';

type Controle = { stop: () => void };
type Champ = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const chiffres = (v: string) => v.replace(/[\s.\-()]/g, '');

/** Message d'erreur en clair pour un champ simple ; chaîne vide = valide. */
function messageChamp(c: Champ): string {
  const v = c.value.trim();
  if (c instanceof HTMLInputElement && c.type === 'checkbox') {
    return c.required && !c.checked ? 'Cochez cette case pour que l’on puisse vous recontacter.' : '';
  }
  if (c.required && !v) {
    if (c instanceof HTMLSelectElement) return 'Choisissez une réponse dans la liste.';
    if (c.dataset.type === 'tel') return 'Indiquez un numéro pour que l’on puisse vous rappeler.';
    return 'Ce champ est obligatoire.';
  }
  if (v && c.dataset.type === 'tel' && !/^(?:\+33|0033|0)[1-9]\d{8}$/.test(chiffres(v))) {
    return 'Vérifiez le numéro : 10 chiffres, par exemple 06 12 34 56 78.';
  }
  if (v && c.dataset.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
    return 'Vérifiez l’adresse e-mail (par exemple nom@exemple.fr), ou laissez ce champ vide.';
  }
  return '';
}

/** Questionnaire en étapes : vérification sous chaque champ, envoi de tout dans un seul e-mail. */
export function brancherFormulaires() {
  document.querySelectorAll<HTMLFormElement>('[data-formulaire]').forEach(brancher);
}

function brancher(form: HTMLFormElement) {
  form.noValidate = true;
  const carte = form.parentElement!;
  const etapes = Array.from(form.querySelectorAll<HTMLFieldSetElement>('[data-etape]'));
  const confirmation = carte.querySelector<HTMLElement>('[data-confirmation]')!;
  const erreurGlobale = form.querySelector<HTMLElement>('[data-erreur-globale]')!;
  const retour = form.querySelector<HTMLButtonElement>('[data-retour]')!;
  const suite = form.querySelector<HTMLButtonElement>('[data-suite]')!;
  const envoyer = form.querySelector<HTMLButtonElement>('[data-envoyer]')!;
  const libelle = envoyer.querySelector<HTMLElement>('[data-libelle]')!;
  const progres = form.querySelector<HTMLElement>('[data-progres]')!;
  const barre = form.querySelector<HTMLElement>('[data-progres-barre]')!;
  const touches = new WeakSet<Element>();
  let courante = 0;
  let anim: Controle | null = null;

  // ── Vérification ─────────────────────────────────────────────────────────
  function afficherMessage(cible: Element, message: string) {
    const sortie = form.querySelector<HTMLElement>(`#${cible.id}-msg`);
    cible.setAttribute('aria-invalid', String(!!message));
    if (sortie && sortie.textContent !== message) sortie.textContent = message;
    return !message;
  }

  function verifierGroupe(g: HTMLFieldSetElement) {
    const coche = g.querySelector('input:checked');
    const message = g.hasAttribute('data-requis') && !coche
      ? g.dataset.groupe === 'choix' ? 'Choisissez une réponse.' : 'Cochez au moins une réponse.'
      : '';
    return afficherMessage(g, message);
  }

  const verifierChamp = (c: Champ) => afficherMessage(c, messageChamp(c));

  /** Champs simples (hors boutons de choix) et groupes d'une étape. */
  const champsDe = (e: HTMLElement) =>
    Array.from(e.querySelectorAll<Champ>('input:not([type=radio]):not([type=checkbox]), select, textarea, #f-rgpd'));
  const groupesDe = (e: HTMLElement) => Array.from(e.querySelectorAll<HTMLFieldSetElement>('[data-groupe]'));

  function verifierEtape(e: HTMLElement) {
    const invalides: HTMLElement[] = [];
    champsDe(e).forEach((c) => {
      touches.add(c);
      if (!verifierChamp(c)) invalides.push(c);
    });
    groupesDe(e).forEach((g) => {
      touches.add(g);
      if (!verifierGroupe(g)) invalides.push(g.querySelector('input')!);
    });
    // Ordre d'affichage, pour donner le focus au premier problème
    invalides.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    return invalides;
  }

  // Vérification pendant la saisie : au premier départ du champ, puis à chaque frappe
  champsDe(form).forEach((c) => {
    c.addEventListener('blur', () => {
      if (c.value || touches.has(c)) {
        touches.add(c);
        verifierChamp(c);
      }
    });
    c.addEventListener(c instanceof HTMLSelectElement || c.type === 'checkbox' ? 'change' : 'input', () => {
      if (c instanceof HTMLSelectElement || (c instanceof HTMLInputElement && c.type === 'checkbox')) touches.add(c);
      if (touches.has(c)) verifierChamp(c);
    });
  });
  groupesDe(form).forEach((g) =>
    g.addEventListener('change', () => {
      touches.add(g);
      verifierGroupe(g);
    }),
  );

  // ── Étapes ───────────────────────────────────────────────────────────────
  function majNavigation() {
    const derniere = courante === etapes.length - 1;
    retour.hidden = courante === 0;
    suite.hidden = derniere;
    envoyer.hidden = !derniere;
    form.querySelector('[data-progres-num]')!.textContent = String(courante + 1);
    form.querySelector('[data-progres-titre]')!.textContent = etapes[courante].dataset.titre ?? '';
    const ratio = (courante + 1) / etapes.length;
    if (mouvementReduit()) barre.style.transform = `scaleX(${ratio})`;
    else animate(barre, { scaleX: ratio }, RESSORT);
  }

  function aller(index: number) {
    const sens = index > courante ? 1 : -1;
    anim?.stop();
    etapes[courante].hidden = true;
    courante = index;
    const etape = etapes[courante];
    etape.hidden = false;
    majNavigation();
    erreurGlobale.textContent = '';

    // La nouvelle étape arrive du côté où l'on va, et repart par le même chemin au retour
    anim = mouvementReduit()
      ? animate(etape, { opacity: [0, 1] }, FONDU)
      : animate(etape, { opacity: [0, 1], x: [24 * sens, 0] }, RESSORT);

    if (carte.getBoundingClientRect().top < 0) carte.scrollIntoView({ block: 'start' });
    etape.querySelector<HTMLElement>('legend')?.focus({ preventScroll: true });
  }

  // Avec JavaScript : une étape à la fois
  progres.hidden = false;
  etapes.forEach((e, i) => (e.hidden = i !== 0));
  majNavigation();

  suite.addEventListener('click', () => {
    const invalides = verifierEtape(etapes[courante]);
    if (invalides.length) return invalides[0].focus();
    aller(courante + 1);
  });
  retour.addEventListener('click', () => aller(courante - 1));

  // Entrée dans un champ texte : passe à l'étape suivante au lieu d'envoyer
  form.addEventListener('keydown', (e) => {
    const cible = e.target as HTMLElement;
    if (e.key === 'Enter' && cible.tagName === 'INPUT' && courante < etapes.length - 1) {
      e.preventDefault();
      suite.click();
    }
  });

  // ── Envoi : un seul e-mail avec toutes les réponses ──────────────────────
  function reponses() {
    const donnees = new FormData(form);
    const parEtape: [string, [string, string][]][] = etapes.map((etape) => {
      const noms = [...new Set(Array.from(etape.querySelectorAll<Champ>('[name]')).map((c) => c.name))];
      return [
        etape.dataset.titre ?? '',
        noms
          .filter((n) => n !== 'Consentement')
          .map((n) => [n, donnees.getAll(n).map(String).map((v) => v.trim()).filter(Boolean).join(', ') || '—']),
      ];
    });
    return parEtape;
  }

  function construireEmail() {
    const parEtape = reponses();
    const valeur = (n: string) => parEtape.flatMap(([, l]) => l).find(([k]) => k === n)?.[1] ?? '—';
    const resume = parEtape
      .map(([titre, lignes]) => `■ ${titre.toUpperCase()}\n${lignes.map(([k, v]) => `${k} : ${v}`).join('\n')}`)
      .join('\n\n');

    const corps: Record<string, string> = {
      _subject: `Demande de maquette : ${valeur('Nom du commerce')} (${valeur('Métier')}, ${valeur('Ville ou arrondissement')})`,
      _template: 'table',
      _captcha: 'false',
      _honey: (form.elements.namedItem('_honey') as HTMLInputElement)?.value ?? '',
      'Résumé complet': resume,
    };
    const email = valeur('E-mail');
    if (email !== '—') corps._replyto = email;
    parEtape.forEach(([, lignes]) => lignes.forEach(([k, v]) => (corps[k] = v)));
    corps['Consentement RGPD'] = 'Oui';
    corps['Envoyé le'] = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
    return corps;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erreurGlobale.textContent = '';
    if (courante < etapes.length - 1) return suite.click();
    const invalides = verifierEtape(etapes[courante]);
    if (invalides.length) return invalides[0].focus();

    envoyer.setAttribute('aria-busy', 'true');
    libelle.textContent = 'Envoi en cours…';
    try {
      // formsubmit.co/adresse → formsubmit.co/ajax/adresse : réponse en JSON, sans quitter la page
      const adresse = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      const reponse = await fetch(adresse, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(construireEmail()),
      });
      const json = await reponse.json().catch(() => ({}));
      if (!reponse.ok || String(json.success) === 'false') throw new Error(json.message || String(reponse.status));
      afficherConfirmation();
    } catch {
      const tel = form.dataset.telephone;
      erreurGlobale.textContent = `L’envoi n’a pas abouti. Réessayez dans un instant${tel ? `, ou appelez-nous au ${tel}` : ''}.`;
      envoyer.removeAttribute('aria-busy');
      libelle.textContent = 'Recevoir ma maquette gratuite';
    }
  });

  function afficherConfirmation() {
    const tel = (form.elements.namedItem('Téléphone') as HTMLInputElement | null)?.value.trim();
    const cible = confirmation.querySelector('[data-confirmation-tel]');
    if (cible && tel) cible.textContent = `au ${tel}`;
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector<HTMLElement>('[data-confirmation-titre]')?.focus();
    animate(confirmation, mouvementReduit() ? { opacity: [0, 1] } : { opacity: [0, 1], y: [12, 0] }, mouvementReduit() ? FONDU : RESSORT);
  }
}
