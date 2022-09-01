import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const postRouter = createProtectedRouter()
  .query("getPosts", {
    input: z.object({
      isMyPosts: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      if (input.isMyPosts) {
        const myPosts = await ctx.prisma.post.findMany({
          where: {
            author: {
              id: ctx.session.user.id,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return myPosts;
      }
      const posts = await ctx.prisma.post.findMany({
        where: {
          isPublished: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return posts;
    },
  })
  .mutation("publish", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          isPublished: true,
        },
      });
    },
  })
  .mutation("unpublish", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          isPublished: false,
        },
      });
    },
  })
  .mutation("create", {
    input: z.object({
      title: z.string(),
      content: z.string(),
      shouldPublishImmediately: z.boolean().default(false),
    }),
    async resolve({ ctx, input }) {
      const newPost = await ctx.prisma.post.create({
        data: {
          content: input.content,
          title: input.title,
          isPublished: input.shouldPublishImmediately,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });

      return { id: newPost.id };
    },
  })
  .mutation("delete", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const postToDelete = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
      });

      if (!postToDelete) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      if (postToDelete.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.post.delete({
        where: {
          id: input.postId,
        },
      });
    },
  });
