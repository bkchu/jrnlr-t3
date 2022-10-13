import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

const unauthenticatedPostRouter = createRouter()
  .query("get-posts.feed.infinite", {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
    }),
    async resolve({ ctx, input }) {
      const limit = input.limit ?? 10;
      const { cursor } = input;
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
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: "desc",
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextPost = posts.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextCursor = nextPost!.id;
      }
      return {
        posts: posts.map((post) => ({
          ...post,
          liked:
            ctx.session && ctx.session.user
              ? post.likes.find((like) => like.userId === ctx.session?.user?.id)
              : false,
        })),
        nextCursor,
      };
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
  .query("get-posts.my-posts.infinite", {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
    }),
    async resolve({ ctx, input }) {
      const limit = input.limit ?? 10;
      const { cursor } = input;
      const posts = await ctx.prisma.user
        .findUnique({
          where: {
            id: ctx.session.user.id,
          },
        })
        .posts({
          where: {
            isPrivate: false,
          },
          include: {
            author: {
              select: {
                username: true,
              },
            },
          },
          take: limit + 1, // get an extra item at the end which we'll use as next cursor
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            id: "desc",
          },
        });
      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextPost = posts.pop();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextCursor = nextPost!.id;
      }
      return {
        posts,
        nextCursor,
      };
    },
  })
  .mutation("publish", {
    input: z.object({
      postId: z.number(),
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
      postId: z.number(),
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
      postId: z.number(),
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

      try {
        const editedPost = await ctx.prisma.post.update({
          where: {
            id: input.postId,
          },
          data: {
            ...postToEdit,
            content: input.content,
            title: input.title,
            slug: slugify(input.title, {
              lower: true, // convert to lower case, defaults to `false`
              strict: true, // strip special characters except replacement, defaults to `false`
              trim: true, // trim leading and trailing replacement chars, defaults to `true`
            }),
          },
        });

        return editedPost;
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
  .mutation("delete", {
    input: z.object({
      postId: z.number(),
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
      postId: z.number().min(1),
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
      postId: z.number().min(1),
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
