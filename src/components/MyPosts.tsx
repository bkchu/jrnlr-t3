import { Post } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { VirtualizedList } from "./lib/VirtualizedList";
import { MyPostsPost } from "./MyPostsPost";

export const MyPosts = () => {
  const {
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

  return (
    <>
      {myInfiniteData && (
        <VirtualizedList
          data={allMyPosts}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          estimateSize={() => 96}
        >
          {(post) => <MyPostsPost key={post?.id} post={post ?? ({} as Post)} />}
        </VirtualizedList>
      )}
    </>
  );
};
