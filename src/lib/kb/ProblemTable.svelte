<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { groupByProblem, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // tickets: where each problem is filed now, problem → issue url and its state.
  type Ticket = { url: string; state: string };
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, Ticket>> } = $props();

  const rows = $derived(reports as Report[]);
  const merged = $derived(uniqueById(rows).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const channels = (g: { channels: Record<string, number> }) =>
    Object.entries(g.channels)
      .sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `${c} ×${n}`)
      .join(' · ');
  const ticketNo = (url: string) => `#${url.split('/').pop()}`;
</script>

<p class="sum">
  <strong>{rows.length}</strong> rows in the export · <strong>{merged.length}</strong> unique reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>channels</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const t = tickets[g.problem]}
      <tr class:open={!t}>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td class="small">{channels(g)}</td>
        <td>{g.tenants}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if t}<a href={t.url}>{ticketNo(t.url)}</a>{:else}no ticket yet{/if}</td>
        <td class:live={t?.state === 'open'}>{t?.state ?? ''}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  {#each Object.entries(g.filedUnder) as [under, n] (under)}
    <p class="note"><code>{g.problem}</code>: {n} {n === 1 ? 'report' : 'reports'} also counted under <code>{under}</code>, where the desk files them by tenant.</p>
  {/each}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .small, .note { color: var(--muted); font-size: 0.85em; }
  .open td { background: var(--warn-bg); }
  .live { color: var(--warn); font-weight: 600; }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
