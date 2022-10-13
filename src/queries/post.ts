import { inferQueryOutput, trpc } from "../utils/trpc";

type Post = ArrayElement<
  inferQueryOutput<"post.get-posts.feed.infinite">["posts"]
>;

export const usePostLike = (post: Post) => {
  const utils = trpc.useContext();

  return trpc.useMutation("post.like", {
    async onSuccess() {
      await utils.cancelQuery(["post.get-posts.feed.infinite"]);

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
            posts: oldPage.posts.map((oldPost) => ({
              ...oldPost,
              _count: {
                ...oldPost._count,
                likes:
                  oldPost.id === post.id
                    ? oldPost._count.likes + 1
                    : oldPost._count.likes,
              },
              liked: post.id === oldPost.id || oldPost.liked,
            })),
          }));

          return {
            pages: newPages,
            pageParams: old.pageParams,
          };
        }
      );
    },
    async onSettled() {
      utils.invalidateQueries(["post.get-posts.feed.infinite", { limit: 10 }]);
    },
  });
};

export const usePostUnlike = (post: Post) => {
  const utils = trpc.useContext();

  return trpc.useMutation("post.unlike", {
    async onSuccess() {
      await utils.cancelQuery(["post.get-posts.feed.infinite"]);

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
            posts: oldPage.posts.map((oldPost) => ({
              ...oldPost,
              _count: {
                ...oldPost._count,
                likes:
                  oldPost.id === post.id
                    ? oldPost._count.likes - 1
                    : oldPost._count.likes,
              },
              liked: post.id === oldPost.id ? false : oldPost.liked,
            })),
          }));

          return {
            pages: newPages,
            pageParams: old.pageParams,
          };
        }
      );
    },
    async onSettled() {
      utils.invalidateQueries(["post.get-posts.feed.infinite", { limit: 10 }]);
    },
  });
};
