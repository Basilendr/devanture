// Vérification automatique : captures (375 / 768 / 1440, clair et sombre), débordements,
// tests au doigt (carrousel, téléphone, accordéon, formulaire), mouvement réduit,
// et génération des images de partage. Usage : npm run build && npm run preview, puis npm run check:visuel
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

import { demarrer } from './serveur.mjs';

const serveur = demarrer();
const URL_SITE = process.env.URL_SITE || 'http://127.0.0.1:4390';
mkdirSync('captures', { recursive: true });
const navigateur = await chromium.launch();
const resultats = [];
const ok = (nom, cond, detail = '') => {
  const ligne = `${cond ? '✓' : '✗'} ${nom}${detail ? ' — ' + detail : ''}`;
  resultats.push(ligne);
  console.log(ligne);
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. Captures et débordements ───────────────────────────────────────────
for (const largeur of [375, 768, 1440]) {
  for (const theme of ['light', 'dark']) {
    const ctx = await navigateur.newContext({ viewport: { width: largeur, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(URL_SITE, { waitUntil: 'networkidle' });
    // Fait défiler pour déclencher les apparitions
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
    });
    await pause(400);
    const deborde = await p.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const fautifs = [...document.querySelectorAll('body *')].filter((el) => {
        if (el.closest('[data-carrousel], .tel__ecran, .serp__plan, .form__piege, .cache, .evitement')) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > w + 1 || r.left < -1);
      }).map((el) => el.className || el.tagName).slice(0, 5);
      return { page: document.documentElement.scrollWidth > w, fautifs };
    });
    ok(`Pas de débordement ${largeur}px ${theme}`, !deborde.page && !deborde.fautifs.length, deborde.fautifs.join(', '));
    await p.screenshot({ path: `captures/${largeur}-${theme}.png`, fullPage: true });
    await ctx.close();
  }
}

// ── 2. Tests au doigt (émulation tactile) ─────────────────────────────────
{
  const ctx = await navigateur.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  await p.goto(URL_SITE, { waitUntil: 'networkidle' });
  const cdp = await ctx.newCDPSession(p);
  const toucher = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const tx = () => p.$eval('[data-piste]', (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);

  await p.locator('#exemples [data-carrousel]').scrollIntoViewIfNeeded();
  const boite = await p.locator('#exemples [data-carrousel]').boundingBox();
  const y = boite.y + boite.height / 2;
  // Lancer rapide vers la gauche
  await toucher('touchStart', 300, y);
  for (let i = 1; i <= 6; i++) { await toucher('touchMove', 300 - i * 30, y); await pause(8); }
  await toucher('touchEnd');
  await pause(60);
  const enVol = await tx();
  // Interrompre en plein vol : on rattrape la piste
  await toucher('touchStart', 200, y);
  const saisi = await tx();
  await pause(120);
  const tenu = await tx();
  ok('Carrousel : rattrapé en vol, il ne bouge plus sous le doigt', enVol !== 0 && Math.abs(tenu - saisi) < 1, `en vol ${enVol.toFixed(0)}, tenu ${saisi.toFixed(0)} → ${tenu.toFixed(0)}`);
  // Renverser : on repart vers la droite
  for (let i = 1; i <= 5; i++) { await toucher('touchMove', 200 + i * 25, y); await pause(16); }
  await toucher('touchEnd');
  await pause(900);
  const repos = await tx();
  const crans = await p.$$eval('[data-piste] > li', (els) => els.map((c) => -(c.offsetLeft - els[0].offsetLeft)));
  ok('Carrousel : s’arrête sur une carte', crans.some((c) => Math.abs(c - repos) < 2) || repos < crans[1], `x=${repos.toFixed(0)}`);
  // Élastique au bord gauche
  await p.focus('[data-carrousel]');
  await p.keyboard.press('Home');
  await pause(800);
  await toucher('touchStart', 60, y);
  for (let i = 1; i <= 10; i++) { await toucher('touchMove', 60 + i * 25, y); await pause(16); }
  const tire = await tx();
  ok('Carrousel : résistance élastique au bord', tire > 0 && tire < 250, `tiré 250px → affiché ${tire.toFixed(0)}px`);
  await toucher('touchEnd');
  await pause(900);
  ok('Carrousel : revient au bord', Math.abs(await tx()) < 1);

  // Accordéon : ouvrir, puis refermer en pleine animation
  const q = p.locator('.faq__question').first();
  await q.scrollIntoViewIfNeeded();
  await q.tap();
  await pause(80);
  await q.tap();
  await pause(700);
  ok('Accordéon : ouvrir puis refermer en vol', !(await p.locator('.faq__el').first().evaluate((d) => d.open)));
  await q.tap();
  await pause(700);
  ok('Accordéon : rouvert', await p.locator('.faq__el').first().evaluate((d) => d.open));

  // Questionnaire en étapes
  const suite = () => p.click('[data-suite]');
  const choisir = (t) => p.locator('[data-etape]:not([hidden]) .options').getByText(t, { exact: true }).click();
  await p.locator('[data-formulaire]').scrollIntoViewIfNeeded();
  await suite();
  ok('Questionnaire : bloque une étape incomplète', (await p.textContent('#q0-0-msg')).length > 0 && (await p.isVisible('[data-etape="0"]')));
  await p.fill('#q0-0', 'Fleurs test');
  await p.selectOption('#q0-1', 'Fleuriste');
  await p.fill('#q0-2', 'Paris 16e');
  await suite();
  ok('Questionnaire : passe à l’étape 2', await p.isVisible('[data-etape="1"]'));
  await suite();
  ok('Questionnaire : choix obligatoire signalé', (await p.textContent('#q1-0-msg')).includes('Choisissez'));
  await choisir('Non, aucun');
  await choisir('Instagram');
  await choisir('Fiche Google (Maps)');
  await suite();
  await choisir('Être trouvé sur Google');
  await choisir('Horaires');
  await suite();
  await choisir('Chaleureux et artisanal');
  await suite();
  ok('Questionnaire : dernière étape atteinte', await p.isVisible('[data-envoyer]'));
  await p.fill('#q4-1', '06 12');
  await p.locator('#q4-1').blur();
  ok('Questionnaire : erreur de téléphone sous le champ', (await p.textContent('#q4-1-msg')).includes('10 chiffres'));
  await p.fill('#q4-1', '06 12 34 56 78');
  ok('Questionnaire : erreur effacée pendant la saisie', (await p.textContent('#q4-1-msg')) === '');
  await p.fill('#q4-0', 'Camille Test');
  await p.click('[data-envoyer]');
  ok('Questionnaire : consentement exigé', (await p.textContent('#f-rgpd-msg')).length > 0);
  await p.check('#f-rgpd');
  let envoye = null;
  await p.route('https://formsubmit.co/**', (r) => {
    envoye = { url: r.request().url(), corps: r.request().postDataJSON() };
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
  });
  await p.click('[data-envoyer]');
  await pause(600);
  ok('Questionnaire : confirmation affichée', await p.isVisible('[data-confirmation]'));
  ok('Questionnaire : un seul e-mail vers l’adresse du site', envoye?.url === 'https://formsubmit.co/ajax/devanture.paris@gmail.com');
  ok('Questionnaire : toutes les réponses dans l’e-mail',
    envoye?.corps?.['Présence en ligne'] === 'Fiche Google (Maps), Instagram' && envoye?.corps?.['Contenu souhaité'] === 'Horaires',
    envoye?.corps?._subject);
  console.log('\n--- Aperçu du résumé envoyé ---\n' + envoye?.corps?.['Résumé complet'] + '\n');
  await p.screenshot({ path: 'captures/confirmation-375.png' });
  await ctx.close();
}

// ── 3. Téléphone à la souris + mouvement réduit ───────────────────────────
for (const reduit of [false, true]) {
  const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduit ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  await p.goto(URL_SITE, { waitUntil: 'networkidle' });
  const b = await p.locator('[data-ecran]').boundingBox();
  const cx = b.x + b.width / 2;
  await p.mouse.move(cx, b.y + b.height - 60);
  await p.mouse.down();
  for (let i = 1; i <= 8; i++) { await p.mouse.move(cx, b.y + b.height - 60 - i * 30); await pause(10); }
  await p.mouse.up();
  await pause(1500);
  const haut = await p.$eval('[data-ecran]', (e) => e.scrollTop);
  ok(`Téléphone : glisser + lancer à la souris${reduit ? ' (mouvement réduit)' : ''}`, reduit ? haut >= 230 && haut < 260 : haut > 260, `scrollTop=${haut}`);
  if (reduit) {
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await pause(500);
    const caches = await p.$$eval('[data-apparition]', (els) => els.filter((e) => {
      const r = e.getBoundingClientRect();
      return r.top < innerHeight * 0.85 && r.bottom > 0 && Number(getComputedStyle(e).opacity) < 0.99;
    }).length);
    ok('Mouvement réduit : contenus visibles', caches === 0);
  }
  await ctx.close();
}

// ── 4. Images de partage et icône ─────────────────────────────────────────
{
  const p = await navigateur.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(`<body style="margin:0;width:1200px;height:630px;background:#faf8f4;font-family:-apple-system,system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;padding:0 96px;box-sizing:border-box;color:#1a1a18">
    <div style="display:flex;align-items:center;gap:18px;font-size:40px;font-weight:700;letter-spacing:-0.02em"><div style="width:52px;height:52px;border-radius:12px;background:repeating-linear-gradient(90deg,#faf8f4 0 7px,transparent 7px 14px) top/100% 16px no-repeat,#1f4d3a"></div>Devanture</div>
    <div style="margin-top:48px;font-size:84px;font-weight:700;line-height:1.05;letter-spacing:-0.03em;max-width:900px">Votre devanture, aussi sur Google.</div>
    <div style="margin-top:36px;font-size:32px;color:#57554f">Maquette gratuite · En ligne en 2 à 3 jours · Sans engagement</div></body>`);
  await p.screenshot({ path: 'public/partage.png' });
  await p.setViewportSize({ width: 180, height: 180 });
  await p.setContent(`<body style="margin:0;width:180px;height:180px;background:repeating-linear-gradient(90deg,#faf8f4 0 18px,transparent 18px 36px) 0 36px/100% 34px no-repeat,#1f4d3a"><div style="position:absolute;left:52px;top:100px;width:76px;height:44px;border:10px solid #faf8f4;border-radius:6px;box-sizing:border-box"></div></body>`);
  await p.screenshot({ path: 'public/apple-touch-icon.png' });
}

await navigateur.close();
serveur.close();
const echecs = resultats.filter((r) => r.startsWith('✗')).length;
console.log(echecs ? `\n${echecs} vérification(s) en échec.` : '\nTout est bon.');
process.exit(echecs ? 1 : 0);
