// Lance Lighthouse (mobile) sur le site construit et affiche les notes. Usage : npm run check:vitesse
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { demarrer } from './serveur.mjs';

const serveur = demarrer();
try {
  // Asynchrone : le serveur, dans ce même processus, doit pouvoir répondre pendant l'analyse
  await new Promise((ok, ko) =>
    spawn('npx', ['lighthouse', 'http://localhost:4322/', '--quiet', '--chrome-flags=--headless=new', '--output=json', '--output-path=captures/lighthouse.json'], {
    env: { ...process.env, CHROME_PATH: chromium.executablePath() },
    stdio: 'inherit',
    }).on('exit', (code) => (code === 0 ? ok() : ko(new Error(`Lighthouse : code ${code}`)))),
  );
} finally {
  serveur.close();
}
const r = JSON.parse(readFileSync('captures/lighthouse.json', 'utf8'));
for (const [nom, c] of Object.entries(r.categories)) console.log(`${nom.padEnd(16)} ${Math.round(c.score * 100)}`);
for (const a of Object.values(r.audits))
  if (a.score !== null && a.score < 0.9 && !['informative', 'manual', 'notApplicable'].includes(a.scoreDisplayMode))
    console.log(`  - ${a.id} ${a.displayValue || ''}`);
