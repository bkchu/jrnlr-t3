import { inferQueryOutput, trpc } from "../utils/trpc";
import { VirtualizedList } from "./lib/VirtualizedList";
import { MyFeedPost } from "./MyFeedPost";

type PostType = ArrayElement<
  inferQueryOutput<"post.get-posts.feed.infinite">["posts"]
>;

export const MyFeed = () => {
  const {
    data: myInfiniteData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = trpc.useInfiniteQuery(["post.get-posts.feed.infinite", { limit: 10 }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const allFeedPosts = myInfiniteData
    ? myInfiniteData.pages.flatMap((d) => d.posts)
    : [];

  return (
    <>
      {myInfiniteData && (
        <VirtualizedList
          data={allFeedPosts}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          estimateSize={() => 160}
        >
          {(post) => (
            <MyFeedPost key={post?.id} post={post ?? ({} as PostType)} />
          )}
        </VirtualizedList>
      )}
    </>
  );
};
