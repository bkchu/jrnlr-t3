import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";

export const unauthenticatedCommentRouter = createRouter().query(
  "get-comments-by-post-id",
  {
    input: z.object({
      postId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const comments = await ctx.prisma.comment.findMany({
        where: {
          postId: input.postId,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          author: {
            select: {
              username: true,
              image: true,
            },
          },
          likes: true,
          _count: {
            select: {
              // this will still get the count of all of the likes
              likes: true,
            },
          },
        },
      });

      const commentsWithLiked = comments.map((comment) => ({
        ...comment,
        liked:
          ctx.session && ctx.session.user
            ? comment.likes.find(
                (like) => like.userId === ctx.session?.user?.id
              )
            : false,
      }));

      type CommentWithChildren = ArrayElement<typeof commentsWithLiked> & {
        children: Array<CommentWithChildren>;
      };

      const roots: Array<CommentWithChildren> = [];
      const mapCommentIdToIndex = new Map<string, number>();

      commentsWithLiked.forEach((comment, i) => {
        mapCommentIdToIndex.set(comment.id, i);

        const commentWithChildren = comment as CommentWithChildren;
        commentWithChildren.children = [];

        if (commentWithChildren?.parentId) {
          const parentIndex = mapCommentIdToIndex.get(
            commentWithChildren.parentId
          );

          if (parentIndex === undefined) {
            return;
          }

          (
            commentsWithLiked[parentIndex] as CommentWithChildren
          ).children?.push(commentWithChildren);
        } else {
          roots.push(commentWithChildren);
        }
      });

      return { roots, count: commentsWithLiked.length };
    },
  }
);

export const authenticatedCommentRouter = createProtectedRouter()
  .mutation("add-comment", {
    input: z.object({
      postId: z.string(),
      parentId: z.string().optional(),
      content: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const comment = await ctx.prisma.comment.create({
        data: {
          postId: input.postId,
          parentId: input.parentId,
          content: input.content,
          authorId: ctx.session.user.id,
        },
      });

      return comment;
    },
  })
  .mutation("delete", {
    input: z.object({
      commentId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const commentToDelete = await ctx.prisma.comment.findUniqueOrThrow({
        where: {
          id: input.commentId,
        },
      });

      if (commentToDelete.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await ctx.prisma.comment.update({
        where: {
          id: input.commentId,
        },
        data: {
          author: {
            disconnect: true,
          },
          content: null,
        },
      });
    },
  })
  .mutation("update", {
    input: z.object({
      commentId: z.string(),
      content: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const commentToUpdate = await ctx.prisma.comment.findUniqueOrThrow({
        where: {
          id: input.commentId,
        },
      });

      if (commentToUpdate.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const updated = await ctx.prisma.comment.update({
        where: {
          id: input.commentId,
        },
        data: {
          content: input.content,
        },
      });

      return updated;
    },
  })
  .mutation("like", {
    input: z.object({
      commentId: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const like = ctx.prisma.commentLike.create({
        data: {
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          comment: {
            connect: {
              id: input.commentId,
            },
          },
        },
      });

      return like;
    },
  })
  .mutation("unlike", {
    input: z.object({
      commentId: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const existingLike = await ctx.prisma.commentLike.findUniqueOrThrow({
        where: {
          commentId_userId: {
            commentId: input.commentId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existingLike.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const unliked = await ctx.prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId: input.commentId,
            userId: ctx.session.user.id,
          },
        },
      });

      return unliked;
    },
  });

export const commentRouter = unauthenticatedCommentRouter.merge(
  authenticatedCommentRouter
);
