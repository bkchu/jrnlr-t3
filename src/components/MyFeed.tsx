import Image from "next/image";
import Link from "next/link";
import pluralize from "pluralize";
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
  const { data: session } = trpc.useQuery(["auth.getSession"]);

  return (
    <div className="group my-8 rounded-xl transition-colors duration-100">
      <div className="relative mb-2 flex items-center justify-between">
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

          <p className="text-sm font-semibold">{post.author.name}</p>

          {/* the little dot */}
          <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>

          {/* the time passed since createdAt */}
          <span className="text-sm text-gray-500">
            {getDurationSinceDate(post.createdAt)}
          </span>
        </div>

        {session?.user.id === post.authorId && (
          <div className="absolute top-0 right-0">
            <Menu isPublished={post.isPublished} postId={post.id} />
          </div>
        )}
      </div>

      <Link href={`/post/${post.id}`}>
        <div className="cursor-pointer">
          <div className="prose mb-4">
            <h2 className="group-hover:text-red-400">{post.title}</h2>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>

            <p className="text-sm text-gray-700">
              {!!post._count.comments ? (
                <span>
                  View {pluralize("comment", post._count.comments, true)}
                </span>
              ) : (
                <span>Be the first to respond!</span>
              )}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};
