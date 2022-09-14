import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const postRouter = createProtectedRouter()
  .query("get-posts.my-posts", {
    async resolve({ ctx }) {
      // const userSelect = Prisma.validator<Prisma.UserSelect>()({
      //   image: true,
      //   name: true,
      // });
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
    },
  })
  .query("get-posts.feed", {
    async resolve({ ctx }) {
      const posts = await ctx.prisma.post.findMany({
        where: {
          isPublished: true,
        },
        include: {
          author: {
            select: {
              image: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return posts;
    },
  })
  .query("get-post", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
        include: {
          author: {
            select: {
              image: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return post;
    },
  })
  .mutation("publish", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

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
      const post = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

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
      title: z.string().min(1),
      content: z.string().min(1),
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
  .mutation("edit", {
    input: z.object({
      postId: z.string(),
      title: z.string().min(1),
      content: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const postToEdit = await ctx.prisma.post.findFirst({
        where: {
          id: input.postId,
        },
      });

      if (!postToEdit) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (postToEdit.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const editedPost = await ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          ...postToEdit,
          content: input.content,
          title: input.title,
        },
      });

      return editedPost;
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
        throw new TRPCError({ code: "NOT_FOUND" });
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
