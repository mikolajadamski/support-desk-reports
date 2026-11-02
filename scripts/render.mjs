// The page as the desk sees it: plain text of every built kb page, next to the HTML copy of ours.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const BUILD = 'build/kb';
const OUT = 'rendered';

const htmlFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : [],
  );

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
export const textOf = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, '')
    .replace(/<\/(p|h\d|tr|li|figcaption|header|aside|footer)>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(\w+|#\d+);/g, (m, e) => entities[e] ?? m)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();

for (const file of htmlFiles(BUILD)) {
  const out = join(OUT, relative(BUILD, file)).replace(/\.html$/, '.txt');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, textOf(readFileSync(file, 'utf8')) + '\n');
}
copyFileSync(join(BUILD, 'incidents/4471-split.html'), join(OUT, '4471-split.html'));
console.log(`rendered ${OUT}/`);
