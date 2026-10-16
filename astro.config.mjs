// @ts-check
import { defineConfig } from 'astro/config';

// [DOMAINE] — remplacez par votre vrai domaine quand vous l'aurez (ex. https://devanture.fr).
// Il sert au plan du site, aux liens de partage et aux données structurées.
export const DOMAINE = 'https://devanture.example';

export default defineConfig({
  site: DOMAINE,
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
});
