import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { listSources, toggleSource, addSource } from '@/modules/jobs/service'

const JobSourceTypeSchema = z.enum(['GREENHOUSE', 'LEVER', 'ADZUNA', 'ARBEITNOW', 'REMOTEOK'])

export const sourcesRouter = createTRPCRouter({
  list: protectedProcedure.query(() => listSources()),

  toggle: protectedProcedure
    .input(z.object({ id: z.string().uuid(), enabled: z.boolean() }))
    .mutation(({ input }) => toggleSource(input.id, input.enabled)),

  add: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: JobSourceTypeSchema,
        config: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(({ input }) =>
      addSource({
        name: input.name,
        type: input.type,
        ...(input.config !== undefined ? { config: input.config } : {}),
      }),
    ),
})
