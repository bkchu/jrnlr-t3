import clsx from "clsx";
import Image from "next/future/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDurationSinceDate } from "../utils/date";
import { inferQueryOutput, trpc } from "../utils/trpc";
import { Menu } from "./Menu";

type PostGetPostsResponse = inferQueryOutput<"post.get-posts.feed">;

export const Post = ({
  post,
}: {
  post: ArrayElement<PostGetPostsResponse>;
}) => {
  const { data: session } = trpc.useQuery(["auth.getSession"]);

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

          <p className="text-sm font-semibold">{post.author.name}</p>

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

      <article className="prose lg:prose-xl">
        {session?.user.id === post.authorId && (
          <span
            className={clsx(
              "mt-8 mb-2 inline-block rounded-full py-1 px-2 text-xs font-bold uppercase",
              {
                "bg-gray-200": !post.isPublished,
                "bg-red-200": post.isPublished,
              }
            )}
          >
            {post.isPublished ? "Published" : "Unpublished"}
          </span>
        )}
        <h1 className="mb-8">{post.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>
    </div>
  );
};
