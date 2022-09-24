import clsx from "clsx";
import Image from "next/future/image";
import { useRouter } from "next/router";
import pluralize from "pluralize";
import ReactMarkdown from "react-markdown";
import { animated } from "react-spring";
import remarkGfm from "remark-gfm";
import { useGrowBoop } from "../hooks/useBoop";
import { getDurationSinceDate } from "../utils/date";
import { inferQueryOutput, trpc } from "../utils/trpc";
import { Menu } from "./Menu";

type PostGetPostResponse = inferQueryOutput<"post.get-post">;

export const Post = ({ post }: { post: PostGetPostResponse }) => {
  const router = useRouter();
  const utils = trpc.useContext();
  const invalidatePost = () => utils.invalidateQueries(["post.get-post"]);
  const { data: session } = trpc.useQuery(["auth.getSession"], {
    enabled: false,
  });

  const [growStyle, growTrigger] = useGrowBoop();

  const { mutate: like } = trpc.useMutation("post.like", {
    onSuccess: invalidatePost,
  });
  const { mutate: unlike } = trpc.useMutation("post.unlike", {
    onSuccess: invalidatePost,
  });

  const toggleLike = () => {
    growTrigger();
    if (post.liked) {
      unlike({
        postId: post.id,
      });
    } else {
      like({
        postId: post.id,
      });
    }
  };

  return (
    <>
      <div className="my-8">
        <div className="my-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 h-8">
              <Image
                className="rounded-full"
                src={post.author.image ?? ""}
                alt={post.author.username ?? ""}
                width={32}
                height={32}
              />
            </div>

            <p className="text-sm font-semibold">{post.author.username}</p>

            {/* the little dot */}
            <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>

            {/* the time passed since createdAt */}
            <span className="text-sm text-gray-500">
              {getDurationSinceDate(post.createdAt)}
            </span>
          </div>
          {session?.user.username === post.authorUsername && (
            <Menu
              isPublished={post.isPublished}
              postId={post.id}
              onEdit={() =>
                router.push(`/${post.authorUsername}/${post.slug}/edit`)
              }
              onPublish={invalidatePost}
              onUnpublish={invalidatePost}
              onDelete={invalidatePost}
            />
          )}
        </div>

        <article className="prose lg:prose-xl">
          {session?.user.username === post.authorUsername && (
            <span
              className={clsx(
                "mt-8 mb-2 inline-block rounded-full py-1 px-2 text-xs font-bold uppercase",
                {
                  "bg-gray-200": !post.isPublished,
                  "bg-rose-200": post.isPublished,
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
      <button
        onClick={toggleLike}
        className="group mt-2 mb-4 flex cursor-pointer items-center gap-1 text-gray-700"
      >
        <animated.svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={growStyle}
          className={clsx("h-6 w-6 duration-75", {
            "fill-rose-400 stroke-rose-500": post.liked,
          })}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </animated.svg>

        <p className="text-sm text-gray-700">
          {pluralize("like", post._count.likes, true)}
        </p>
      </button>
    </>
  );
};
