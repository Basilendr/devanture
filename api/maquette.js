// Reçoit le questionnaire « maquette gratuite » et l'envoie, en un seul e-mail, à l'adresse du site.
// Passer par ici (plutôt que d'appeler FormSubmit depuis le navigateur) rend l'envoi indépendant
// de l'adresse du site : préversions Vercel, domaine définitif… tout fonctionne sans réactivation.
const DESTINATAIRE = 'devanture.paris@gmail.com';
// Adresse déjà activée auprès de FormSubmit pour ce destinataire (ne pas changer sans réactiver).
const REFERENT = 'https://devanture-kevin-2836.vercel.app/';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Méthode non autorisée' });

  const enJson = !String(req.headers['content-type'] || '').includes('urlencoded');
  let corps = req.body ?? {};
  if (typeof corps === 'string') {
    try {
      corps = JSON.parse(corps);
    } catch {
      corps = Object.fromEntries(new URLSearchParams(corps));
    }
  }
  // Cases cochées multiples (envoi sans JavaScript) : une seule ligne
  for (const [cle, valeur] of Object.entries(corps)) if (Array.isArray(valeur)) corps[cle] = valeur.join(', ');

  const repondre = (ok, message) =>
    enJson ? res.status(ok ? 200 : 502).json({ success: ok, message }) : res.redirect(303, ok ? '/merci' : '/#maquette');

  // Piège anti-robots rempli : on fait semblant que tout va bien
  if (corps._honey) return repondre(true);

  try {
    const r = await fetch(`https://formsubmit.co/ajax/${DESTINATAIRE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: REFERENT.replace(/\/$/, ''),
        Referer: REFERENT,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
      },
      body: JSON.stringify({ _template: 'table', _captcha: 'false', ...corps }),
    });
    const donnees = await r.json().catch(() => ({}));
    const ok = r.ok && String(donnees.success) === 'true';
    if (!ok) console.error('FormSubmit a refusé l’envoi', r.status, donnees);
    return repondre(ok, donnees.message);
  } catch (erreur) {
    console.error('Envoi impossible', erreur);
    return repondre(false, 'Envoi impossible');
  }
}
