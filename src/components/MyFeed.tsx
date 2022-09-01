import Image from "next/image";
import { getDurationSinceDate } from "../utils/date";
import { inferQueryOutput, trpc } from "../utils/trpc";
import { Menu } from "./Menu";

type PostGetPostsResponse = inferQueryOutput<"post.get-posts.feed">;

export const MyFeed = ({ posts }: { posts: PostGetPostsResponse }) => (
  <>
    {posts.map((post) => (
      <MyFeedPost key={post.id} post={post} />
    ))}
  </>
);

export const MyFeedPost = ({
  post,
}: {
  post: ArrayElement<PostGetPostsResponse>;
}) => {
  const {
    isLoading,
    isFetching,
    data: session,
  } = trpc.useQuery(["auth.getSession"]);

  return (
    <div className="my-8">
      <div className="my-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 h-8">
            <Image
              className="rounded-full"
              src={post.author.image ?? ""}
              alt={post.author.name ?? ""}
              width={32}
              height={32}
            />
          </div>

          <p className="text-sm font-semibold">{session?.user?.name}</p>

          {/* the little dot */}
          <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>

          {/* the time passed since createdAt */}
          <span className="text-sm text-gray-500">
            {getDurationSinceDate(post.createdAt)}
          </span>
        </div>
        {session?.user.id === post.authorId && (
          <Menu isPublished={post.isPublished} postId={post.id} />
        )}
      </div>
      <h2 className="text-lg font-bold">{post.title}</h2>
      <div>{`${post.content.slice(0, 300)}${
        post.content.length > 300 ? "..." : ""
      }`}</div>
    </div>
  );
};
