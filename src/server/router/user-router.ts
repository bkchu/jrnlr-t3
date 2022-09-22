import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const userRouter = createProtectedRouter().mutation("add-username", {
  input: z.object({
    userId: z.string().min(1),
    username: z.string().min(3).max(16),
  }),
  async resolve({ ctx, input }) {
    await ctx.prisma.user.findUniqueOrThrow({
      where: {
        id: input.userId,
      },
    });

    const exists = await ctx.prisma.user.findFirst({
      where: {
        username: input.username,
      },
    });

    if (exists) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "There was problem creating your username.",
      });
    }

    return ctx.prisma.user.update({
      where: {
        id: input.userId,
      },
      data: {
        username: input.username,
        isOnboarded: true,
      },
    });
  },
});
