import { InfiniteData } from "react-query";
import { inferQueryOutput, trpc } from "../utils/trpc";

type GetFeedPostsInfiniteResponse =
  inferQueryOutput<"post.get-posts.feed.infinite">;

type GetMyPostsInfiniteResponse =
  inferQueryOutput<"post.get-posts.my-posts.infinite">;

type FeedPost = ArrayElement<GetFeedPostsInfiniteResponse["posts"]>;

type MyPost = ArrayElement<GetMyPostsInfiniteResponse["posts"]>;

type MutationOptions =
  | {
      onSuccess?:
        | ((
            data: unknown,
            variables: {
              postId: number;
            },
            context: unknown
          ) => void | Promise<unknown>)
        | undefined;
      onError?:
        | ((
            err: unknown,
            variables: { postId: number },
            ctx: unknown
          ) => void | Promise<unknown>)
        | undefined;
      onSettled?:
        | ((
            data: unknown | undefined,
            err: unknown,
            variables: { postId: number },
            ctx: unknown
          ) => void | Promise<unknown>)
        | undefined;
    }
  | undefined;

export const useOptimisticallyUpdateInfiniteFeedPosts = (): ((
  makeNewPosts: (oldPosts: FeedPost[]) => FeedPost[],
  opts?: MutationOptions | undefined
) => MutationOptions) => {
  const utils = trpc.useContext();
  return (makeNewPosts, opts) => ({
    async onSuccess(...args) {
      await utils.cancelQuery(["post.get-posts.feed.infinite"]);

      const previous = utils.getInfiniteQueryData([
        "post.get-posts.feed.infinite",
        { limit: 10 },
      ]);

      utils.setInfiniteQueryData(
        ["post.get-posts.feed.infinite", { limit: 10 }],
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = old.pages.map((oldPage) => ({
            ...oldPage,
            posts: makeNewPosts(oldPage.posts),
          }));

          return {
            pages: newPages,
            pageParams: old.pageParams,
          };
        }
      );

      opts?.onSuccess?.(...args);

      return {
        previous,
      };
    },
    async onError(err, variables, ctx) {
      utils.setInfiniteQueryData(
        ["post.get-posts.feed.infinite"],
        (
          ctx as {
            previous: InfiniteData<GetFeedPostsInfiniteResponse>;
          }
        ).previous
      );
      opts?.onError?.(err, variables, ctx);
    },
    async onSettled(...args) {
      utils.invalidateQueries(["post.get-posts.feed.infinite", { limit: 10 }]);
      opts?.onSettled?.(...args);
    },
  });
};

export const useOptimisticallyUpdateInfiniteMyPosts = (): ((
  makeNewPosts: (oldPosts: MyPost[]) => MyPost[],
  opts?: MutationOptions | undefined
) => MutationOptions) => {
  const utils = trpc.useContext();
  return (makeNewPosts, opts) => ({
    async onSuccess(...args) {
      await utils.cancelQuery(["post.get-posts.my-posts.infinite"]);

      const previous = utils.getInfiniteQueryData([
        "post.get-posts.my-posts.infinite",
        { limit: 10 },
      ]);

      utils.setInfiniteQueryData(
        ["post.get-posts.my-posts.infinite", { limit: 10 }],
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = old.pages.map((oldPage) => ({
            ...oldPage,
            posts: makeNewPosts(oldPage.posts),
          }));

          return {
            pages: newPages,
            pageParams: old.pageParams,
          };
        }
      );

      opts?.onSuccess?.(...args);

      return {
        previous,
      };
    },
    async onError(err, variables, ctx) {
      utils.setInfiniteQueryData(
        ["post.get-posts.my-posts.infinite"],
        (
          ctx as {
            previous: InfiniteData<GetMyPostsInfiniteResponse>;
          }
        ).previous
      );
      opts?.onError?.(err, variables, ctx);
    },
    async onSettled(...args) {
      utils.invalidateQueries([
        "post.get-posts.my-posts.infinite",
        { limit: 10 },
      ]);
      opts?.onSettled?.(...args);
    },
  });
};

export const usePostLike = (post: FeedPost) => {
  const updateInfinitePosts = useOptimisticallyUpdateInfiniteFeedPosts();

  return trpc.useMutation(
    "post.like",
    updateInfinitePosts((oldPosts) =>
      oldPosts.map((oldPost) => ({
        ...oldPost,
        _count: {
          ...oldPost._count,
          likes:
            oldPost.id === post.id
              ? oldPost._count.likes + 1
              : oldPost._count.likes,
        },
        liked: post.id === oldPost.id || oldPost.liked,
      }))
    )
  );
};

export const usePostUnlike = (post: FeedPost) => {
  const updateInfinitePosts = useOptimisticallyUpdateInfiniteFeedPosts();

  return trpc.useMutation(
    "post.unlike",
    updateInfinitePosts((oldPosts) =>
      oldPosts.map((oldPost) => ({
        ...oldPost,
        _count: {
          ...oldPost._count,
          likes:
            oldPost.id === post.id
              ? oldPost._count.likes - 1 < 0
                ? 0
                : oldPost._count.likes - 1
              : oldPost._count.likes,
        },
        liked: post.id === oldPost.id ? false : oldPost.liked,
      }))
    )
  );
};
