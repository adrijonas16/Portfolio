import fs from 'node:fs';
import path from 'node:path';

const INCLUDE = /<!--\s*@include\s+([\w./-]+)\s*-->/g;

/**
 * Build-time HTML partials: `<!-- @include partials/hero.html -->` is replaced by the file's content
 * (paths are relative to /src, includes can nest). The page still ships as one static HTML file,
 * so it is readable without JavaScript and by search engines.
 */
export default function htmlPartials({ root = 'src' } = {}) {
  const base = path.resolve(root);

  const expand = (html, seen = []) =>
    html.replace(INCLUDE, (_, file) => {
      const full = path.resolve(base, file);
      if (!full.startsWith(base)) throw new Error(`@include outside ${root}/: ${file}`);
      if (seen.includes(full)) throw new Error(`Circular @include: ${[...seen, full].join(' → ')}`);
      if (!fs.existsSync(full)) throw new Error(`@include not found: ${file}`);
      return expand(fs.readFileSync(full, 'utf8').trimEnd(), [...seen, full]);
    });

  return {
    name: 'html-partials',
    transformIndexHtml: { order: 'pre', handler: (html) => expand(html) },
    // editing a partial reloads the page in dev
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.html') && file.startsWith(base)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
