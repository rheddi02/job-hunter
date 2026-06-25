import { db } from '@jobpilot/db'
import { ingestionQueue } from '../../lib/queues'

const DEFAULT_INTERVAL_MINUTES: Record<string, number> = {
  GREENHOUSE: 120,
  LEVER: 120,
  ADZUNA: 60,
  ARBEITNOW: 60,
  REMOTEOK: 60,
}

export async function setupSchedulers(): Promise<void> {
  const sources = await db.jobSource.findMany({ where: { enabled: true } })

  for (const source of sources) {
    const config = (source.config ?? {}) as Record<string, unknown>
    const intervalMinutes =
      typeof config.pollIntervalMinutes === 'number'
        ? config.pollIntervalMinutes
        : (DEFAULT_INTERVAL_MINUTES[source.type] ?? 60)

    await ingestionQueue.upsertJobScheduler(
      `ingest-${source.id}`,
      { every: intervalMinutes * 60 * 1000 },
      { data: { sourceId: source.id } },
    )

    // Run once immediately on startup so the first poll doesn't wait a full interval
    await ingestionQueue.add('ingest-now', { sourceId: source.id })
  }

  console.log(`[scheduler] registered ${sources.length} source(s) — queued immediate run for each`)
}
