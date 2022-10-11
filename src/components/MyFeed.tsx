import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect } from "react";
import { inferQueryOutput, trpc } from "../utils/trpc";
import { MyFeedPost } from "./MyFeedPost";

type PostType = ArrayElement<
  inferQueryOutput<"post.get-posts.feed.infinite">["posts"]
>;

export const MyFeed = () => {
  const {
    isLoading: isInfiniteLoading,
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
  const rowVirtualizer = useWindowVirtualizer({
    count: hasNextPage ? allFeedPosts.length + 1 : allFeedPosts.length,
    estimateSize: () => 152,
    overscan: 10,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allFeedPosts.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasNextPage,
    fetchNextPage,
    allFeedPosts.length,
    isFetchingNextPage,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    rowVirtualizer.getVirtualItems(),
  ]);

  if (isInfiniteLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const isLoaderRow = virtualRow.index > allFeedPosts.length - 1;
        const post = allFeedPosts[virtualRow.index];

        return (
          <div
            key={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {isLoaderRow ? (
              hasNextPage ? (
                "Loading more..."
              ) : (
                "Nothing more to load"
              )
            ) : (
              <MyFeedPost key={post?.id} post={post ?? ({} as PostType)} />
            )}
          </div>
        );
      })}
    </div>
  );
};
