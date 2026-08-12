import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { repairRoadmapLinks } from '../lib/ai/roadmapLinks';

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-n');
const CONFIRM = process.argv.includes('--yes') || process.argv.includes('-y');

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === 'object') {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    if (aKeys.join(',') !== bKeys.join(',')) return false;
    return aKeys.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

async function main() {
  const roadmaps = await prisma.roadmap.findMany({
    select: { id: true, title: true, phases: true, totalTasks: true },
  });
  console.log(`Found ${roadmaps.length} roadmaps. Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : CONFIRM ? 'UPDATE' : 'DRY RUN (use --yes to apply)'}`);

  let totalChecked = 0;
  let totalKept = 0;
  let totalReplaced = 0;
  let totalDropped = 0;
  let changed = 0;
  let failed = 0;

  for (const rm of roadmaps) {
    let phases: any;
    try {
      phases = typeof rm.phases === 'string' ? JSON.parse(rm.phases) : rm.phases;
    } catch {
      console.warn(`[skip] roadmap ${rm.id} "${rm.title}" has unparseable phases`);
      failed++;
      continue;
    }
    if (!Array.isArray(phases)) {
      console.warn(`[skip] roadmap ${rm.id} "${rm.title}" has no phases array`);
      failed++;
      continue;
    }

    const before = JSON.parse(JSON.stringify(phases));
    const { roadmap: repaired, stats } = await repairRoadmapLinks({ ...rm, phases });

    totalChecked += stats.checked;
    totalKept += stats.kept;
    totalReplaced += stats.replaced;
    totalDropped += stats.dropped;

    const newTotalTasks = repaired.totalTasks || 0;
    const hasChanges = !deepEqual(repaired.phases, before) || newTotalTasks !== rm.totalTasks;

    if (!hasChanges) continue;

    changed++;
    const detail = `(replaced=${stats.replaced}, dropped=${stats.dropped}, kept=${stats.kept})`;
    if (DRY_RUN || !CONFIRM) {
      console.log(`[dry] ${rm.id} "${rm.title}" would be updated ${detail}`);
      continue;
    }

    await prisma.roadmap.update({
      where: { id: rm.id },
      data: { phases: repaired.phases as any, totalTasks: newTotalTasks },
    });
    console.log(`[ok] ${rm.id} "${rm.title}" updated ${detail}`);
  }

  console.log(`\nSummary: roadmaps=${roadmaps.length} changed=${changed} skipped/failed=${failed}`);
  console.log(`Links: checked=${totalChecked} kept=${totalKept} replaced=${totalReplaced} dropped=${totalDropped}`);

  if (!DRY_RUN && !CONFIRM) {
    console.log('\nNo changes applied. Re-run with --yes to apply updates.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
