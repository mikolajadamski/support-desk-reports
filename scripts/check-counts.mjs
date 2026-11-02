// Our split must count the way the desk counts: every cause in the desk's table (CauseTable) has the
// same number of reports in ours (ProblemTable). Read from the built page, as the desk sees it.
import { readFileSync } from 'node:fs';

const html = readFileSync('build/kb/incidents/4471-split.html', 'utf8');
const tables = [...html.matchAll(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g)].map(([, body]) =>
  Object.fromEntries([...body.matchAll(/<tr[^>]*>\s*<td[^>]*><code[^>]*>([^<]+)<\/code><\/td>\s*<td[^>]*>(\d+)<\/td>/g)].map(([, k, n]) => [k, Number(n)])),
);
if (tables.length !== 2) {
  console.error(`expected our table and the desk's table, found ${tables.length}`);
  process.exit(1);
}
const [ours, desk] = tables;
const wrong = Object.entries(desk).filter(([cause, n]) => ours[cause] !== n);
if (wrong.length) {
  console.error(wrong.map(([cause, n]) => `${cause}: desk counts ${n}, page counts ${ours[cause] ?? 'nothing'}`).join('\n'));
  process.exit(1);
}
console.log(`counts match the desk: ${Object.entries(desk).map(([c, n]) => `${c} ${n}`).join(', ')}`);
