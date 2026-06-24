import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  listApplicationsWithMatches,
  transitionApplication,
} from '@/modules/applications/service'
import type { ApplicationStatus } from '@jobpilot/db'

const APPLICATION_STATUSES = ['MATCHED', 'DRAFTED', 'APPLIED', 'INTERVIEWING', 'REJECTED', 'GHOSTED'] as const

export const applicationsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return listApplicationsWithMatches(ctx.user.id)
  }),

  transition: protectedProcedure
    .input(
      z.object({
        applicationId: z.string().uuid(),
        toStatus: z.enum(APPLICATION_STATUSES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await transitionApplication(
        ctx.user.id,
        input.applicationId,
        input.toStatus as ApplicationStatus,
      )
    }),
})
