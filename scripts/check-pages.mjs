// Every page we add to the kb follows the README's conventions. The desk's own exported pages are
// listed in DESK_PAGES and left as they are.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src/routes/kb';
const DESK_PAGES = new Set([
  '+page.svx',
  'decisions/0001-dedupe-by-subject/+page.svx',
  'incidents/4471/+page.svx',
  'triage/dedupe/+page.svx',
]);
const FIELDS = ['title', 'owner', 'status', 'reviewed', 'signature'];
// The course hands out the signature as a ticket from start-challenge, never a name.
const TICKET = /^v1\.[\w-]+\.[\w-]+$/;

const pages = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? pages(join(dir, e.name)) : e.name === '+page.svx' ? [join(dir, e.name)] : [],
  );

const problems = [];
for (const file of pages(ROOT)) {
  if (DESK_PAGES.has(relative(ROOT, file))) continue;
  const text = readFileSync(file, 'utf8');
  const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const meta = Object.fromEntries(front.split('\n').map((l) => l.match(/^(\w+):\s*(.*)$/)?.slice(1) ?? []).filter((p) => p.length));
  for (const f of FIELDS) if (!meta[f]) problems.push(`${file}: frontmatter has no \`${f}\``);
  if (meta.signature && !TICKET.test(meta.signature)) problems.push(`${file}: signature is not a course ticket (call start-challenge)`);
  if (!text.trimEnd().endsWith('<RenderStamp {signature} />')) problems.push(`${file}: does not end with <RenderStamp {signature} />`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('pages ok');
