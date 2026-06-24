import { ingestionWorker } from './modules/jobs/ingestion.worker'
import { matchingWorker } from './modules/matching/matching.worker'
import { coverletterWorker } from './modules/coverletters/coverletter.worker'

console.log('JobPilot worker starting...')

for (const worker of [ingestionWorker, matchingWorker, coverletterWorker]) {
  worker.on('ready', () => {
    console.log(`[worker:${worker.name}] ready`)
  })
  worker.on('error', (err) => {
    console.error(`[worker:${worker.name}] error`, err)
  })
}

console.log('Workers registered:', [ingestionWorker.name, matchingWorker.name, coverletterWorker.name])
