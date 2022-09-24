import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

const unauthenticatedPostRouter = createRouter()
  .query("get-posts.feed", {
    async resolve({ ctx }) {
      const posts = await ctx.prisma.post.findMany({
        where: {
          isPublished: true,
          isPrivate: false,
        },
        include: {
          author: {
            select: {
              image: true,
              username: true,
            },
          },
          // only gets the information for my own like, even if there are more likes
          likes: true,
          _count: {
            select: {
              comments: true,
              // this will still get the count of all of the likes
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
        liked:
          ctx.session && ctx.session.user
            ? post.likes.find((like) => like.userId === ctx.session?.user?.id)
            : false,
      }));
    },
  })
  .query("get-post", {
    input: z.object({
      authorUsername: z.string().min(1),
      postSlug: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const post = await ctx.prisma.post.findUniqueOrThrow({
        where: {
          authorUsername_slug: {
            authorUsername: input.authorUsername,
            slug: input.postSlug,
          },
        },
        include: {
          author: {
            select: {
              image: true,
              username: true,
            },
          },
          likes: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

      return {
        ...post,
        liked:
          ctx.session && ctx.session.user
            ? post.likes.find((like) => like.userId === ctx.session?.user?.id)
            : false,
      };
    },
  });

const authenticatedPostRouter = createProtectedRouter()
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
        include: {
          author: {
            select: {
              username: true,
            },
          },
        },
      });

      return myPosts;
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

      if (post.authorUsername !== ctx.session.user.username) {
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

      if (post.authorUsername !== ctx.session.user.username) {
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
      title: z.string().min(1).max(300),
      content: z.string().min(1),
      shouldPublishImmediately: z.boolean().default(false),
    }),
    async resolve({ ctx, input }) {
      try {
        const newPost = await ctx.prisma.post.create({
          data: {
            content: input.content,
            title: input.title,
            slug: slugify(input.title, {
              lower: true, // convert to lower case, defaults to `false`
              strict: true, // strip special characters except replacement, defaults to `false`
              trim: true, // trim leading and trailing replacement chars, defaults to `true`
            }),
            isPublished: input.shouldPublishImmediately,
            author: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
        });

        return newPost;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Please use a unique title.",
              cause: e.meta,
            });
          }
        }
      }
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

      if (postToEdit.authorUsername !== ctx.session.user.username) {
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

      if (postToDelete.authorUsername !== ctx.session.user.username) {
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
      postId: z.string().min(1),
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
      postId: z.string().min(1),
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

export const postRouter = unauthenticatedPostRouter.merge(
  authenticatedPostRouter
);
