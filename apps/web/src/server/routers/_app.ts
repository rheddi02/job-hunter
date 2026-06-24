import { createTRPCRouter } from '../trpc'
import { profileRouter } from './profile'
import { sourcesRouter } from './sources'
import { jobsRouter } from './jobs'
import { coverlettersRouter } from './coverletters'
import { applicationsRouter } from './applications'

export const appRouter = createTRPCRouter({
  profile: profileRouter,
  sources: sourcesRouter,
  jobs: jobsRouter,
  coverletters: coverlettersRouter,
  applications: applicationsRouter,
})

export type AppRouter = typeof appRouter
