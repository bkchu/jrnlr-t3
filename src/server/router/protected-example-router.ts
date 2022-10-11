import { createProtectedRouter } from "./protected-router";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedExampleRouter = createProtectedRouter().query(
  "getSession",
  {
    async resolve({ ctx }) {
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: ctx.session.user.id,
        },
      });

      return {
        ...ctx.session,
        user: {
          ...ctx.session.user,
          isOnboarded: user.isOnboarded,
          username: user.username,
          givenName: user.givenName,
          familyName: user.familyName,
          locale: user.locale,
        },
      };
    },
  }
);
