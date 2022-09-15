import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const postRouter = createProtectedRouter()
  .query("get-posts.my-posts", {
    async resolve({ ctx }) {
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
          // only gets the information for my own like, even if there are more likes
          likes: true,
          _count: {
            select: {
              comments: true,
              // this will get the count of all of the likes
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // put a simple boolean 'liked'
      return posts.map((post) => ({
        ...post,
        liked: post.likes.some((like) => like.userId === ctx.session.user.id),
      }));
    },
  })
  .query("get-post", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findUniqueOrThrow({
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

      return post;
    },
  })
  .mutation("publish", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findUniqueOrThrow({
        where: {
          id: input.postId,
        },
      });

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
      const post = await ctx.prisma.post.findUniqueOrThrow({
        where: {
          id: input.postId,
        },
      });

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
      const postToEdit = await ctx.prisma.post.findUniqueOrThrow({
        where: {
          id: input.postId,
        },
      });

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
      const postToDelete = await ctx.prisma.post.findUniqueOrThrow({
        where: {
          id: input.postId,
        },
      });

      if (postToDelete.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.post.delete({
        where: {
          id: input.postId,
        },
      });
    },
  })
  .mutation("like", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const like = await ctx.prisma.postLike.create({
        data: {
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          post: {
            connect: {
              id: input.postId,
            },
          },
        },
      });

      return like;
    },
  })
  .mutation("unlike", {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const existingLike = await ctx.prisma.postLike.findUniqueOrThrow({
        where: {
          postId_userId: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        },
      });

      if (existingLike.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const unliked = await ctx.prisma.postLike.delete({
        where: {
          postId_userId: {
            userId: ctx.session.user.id,
            postId: input.postId,
          },
        },
      });

      return unliked;
    },
  });
