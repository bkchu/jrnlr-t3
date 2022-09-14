import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const commentRouter = createProtectedRouter()
  .query("get-comments-by-post-id", {
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
              name: true,
              image: true,
            },
          },
        },
      });

      type CommentWithChildren = ArrayElement<typeof comments> & {
        children: Array<CommentWithChildren>;
      };

      const roots: Array<CommentWithChildren> = [];
      const mapCommentIdToIndex = new Map<string, number>();

      comments.forEach((comment, i) => {
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

          (comments[parentIndex] as CommentWithChildren).children?.push(
            commentWithChildren
          );
        } else {
          roots.push(commentWithChildren);
        }
      });

      return { roots, count: comments.length };
    },
  })
  .mutation("add-comment", {
    input: z.object({
      postId: z.string(),
      parentId: z.string().optional(),
      content: z.string(),
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

      await ctx.prisma.comment.delete({
        where: {
          id: input.commentId,
        },
      });
    },
  })
  .mutation("update", {
    input: z.object({
      commentId: z.string(),
      content: z.string(),
    }),
    async resolve({ ctx, input }) {
      const commentToUpdate = await ctx.prisma.comment.findUniqueOrThrow({
        where: {
          id: input.commentId,
        },
      });

      if (!commentToUpdate) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

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
  });
