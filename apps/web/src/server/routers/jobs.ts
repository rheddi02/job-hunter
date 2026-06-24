import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { listMatches, getJobDetail } from '@/modules/jobs/service'

const RemoteTypeSchema = z.enum(['REMOTE', 'HYBRID', 'ONSITE', 'UNKNOWN'])

export const jobsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(20),
        scoreMin: z.number().int().min(0).max(100).optional(),
        scoreMax: z.number().int().min(0).max(100).optional(),
        sourceId: z.string().uuid().optional(),
        remoteType: RemoteTypeSchema.optional(),
      }),
    )
    .query(({ ctx, input }) =>
      listMatches(ctx.user.id, {
        page: input.page,
        pageSize: input.pageSize,
        ...(input.scoreMin !== undefined ? { scoreMin: input.scoreMin } : {}),
        ...(input.scoreMax !== undefined ? { scoreMax: input.scoreMax } : {}),
        ...(input.sourceId !== undefined ? { sourceId: input.sourceId } : {}),
        ...(input.remoteType !== undefined ? { remoteType: input.remoteType } : {}),
      }),
    ),

  get: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .query(({ ctx, input }) => getJobDetail(ctx.user.id, input.jobId)),
})
