import { Post } from "@prisma/client";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect } from "react";
import { trpc } from "../utils/trpc";
import { MyPostsPost } from "./MyPostsPost";

export const MyPosts = () => {
  const {
    isLoading: isInfiniteLoading,
    data: myInfiniteData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = trpc.useInfiniteQuery(
    ["post.get-posts.my-posts.infinite", { limit: 10 }],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const allMyPosts = myInfiniteData
    ? myInfiniteData.pages.flatMap((d) => d.posts)
    : [];
  const rowVirtualizer = useWindowVirtualizer({
    count: hasNextPage ? allMyPosts.length + 1 : allMyPosts.length,
    estimateSize: () => 96,
    overscan: 20,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allMyPosts.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasNextPage,
    fetchNextPage,
    allMyPosts.length,
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
        const isLoaderRow = virtualRow.index > allMyPosts.length - 1;
        const post = allMyPosts[virtualRow.index];

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
              <MyPostsPost key={post?.id} post={post ?? ({} as Post)} />
            )}
          </div>
        );
      })}
    </div>
  );
};
