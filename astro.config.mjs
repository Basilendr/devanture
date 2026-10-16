// @ts-check
import { defineConfig } from 'astro/config';

// Adresse publique du site. Si vous prenez un nom de domaine (ex. https://devanture.fr), changez-la ici :
// elle sert au plan du site, aux liens de partage, aux données structurées et au formulaire
// (FormSubmit demandera alors une nouvelle activation par e-mail, voir README).
export const DOMAINE = 'https://devanture-seven.vercel.app';

export default defineConfig({
  site: DOMAINE,
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
});
