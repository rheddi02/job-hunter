import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import {
  getProfile,
  parseAndStoreResume,
  updateProfileSkills,
} from '@/modules/profile/service'

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getProfile(ctx.user.id)
  }),

  parseResume: protectedProcedure
    .input(z.object({ storagePath: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return parseAndStoreResume(ctx.user.id, input.storagePath)
    }),

  updateSkills: protectedProcedure
    .input(z.object({ skills: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return updateProfileSkills(ctx.user.id, input.skills)
    }),
})
