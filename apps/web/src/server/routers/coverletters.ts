import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  generateCoverLetter,
  getLatestCoverLetter,
  updateCoverLetterContent,
} from '@/modules/coverletters/service'

export const coverlettersRouter = createTRPCRouter({
  getLatest: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .query(({ ctx, input }) => getLatestCoverLetter(ctx.user.id, input.jobId)),

  generate: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .mutation(({ ctx, input }) => generateCoverLetter(ctx.user.id, input.jobId)),

  updateContent: protectedProcedure
    .input(z.object({ coverLetterId: z.string().uuid(), content: z.string().min(1) }))
    .mutation(({ input }) => updateCoverLetterContent(input.coverLetterId, input.content)),
})
