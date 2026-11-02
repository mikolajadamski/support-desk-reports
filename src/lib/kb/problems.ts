// What a merged ticket actually holds. causes.ts sorts reports by tenant; desk-notes.json lists the
// reports the desk read as a one-day move. The desk counts those where they're filed, by tenant;
// a one-day move is not a day/month swap, so it also gets a row of its own.
import { causeOf, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  channels: Record<string, number>;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // Where the desk files these reports, when that is another row: problem → count.
  filedUnder: Partial<Record<Problem, number>>;
};

function group(problem: Problem, rs: Report[], filedUnder: ProblemGroup['filedUnder'] = {}): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    filedUnder,
  };
}

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const byCause = new Map<Problem, Report[]>();
  for (const r of reports) {
    const cause = causeOf(r, tenantOf(r)) ?? 'unplaced';
    byCause.set(cause, [...(byCause.get(cause) ?? []), r]);
  }
  const groups = [...byCause.entries()].map(([cause, rs]) => group(cause, rs));

  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const filedUnder = moved.reduce<ProblemGroup['filedUnder']>((n, r) => {
      const cause = causeOf(r, tenantOf(r)) ?? 'unplaced';
      return { ...n, [cause]: (n[cause] ?? 0) + 1 };
    }, {});
    groups.push(group('one-day', moved, filedUnder));
  }
  return groups.sort((a, b) => b.reports.length - a.reports.length);
}
