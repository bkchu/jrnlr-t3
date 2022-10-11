import { Post } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { getDurationSinceDate } from "../utils/date";
import { trpc } from "../utils/trpc";
import { PostMenu } from "./posts/PostMenu";

export const MyPostsPost = ({ post }: { post: Post }) => {
  const router = useRouter();
  const utils = trpc.useContext();
  const invalidatePost = () =>
    utils.invalidateQueries(["post.get-posts.my-posts.infinite"]);
  return (
    <div className="group mb-8 cursor-pointer">
      <div className="relative mb-2 flex items-center justify-between">
        <p className="flex items-center">
          {/* the pill showing published/unpublished */}
          <span
            className={clsx(
              "inline-block rounded-full py-1 px-2 text-xs font-bold uppercase",
              {
                "bg-gray-200": !post.isPublished,
                "bg-rose-200": post.isPublished,
              }
            )}
          >
            {post.isPublished ? "Published" : "Unpublished"}
          </span>

          {/* the little dot */}
          <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>

          {/* the time passed since createdAt */}
          <span className="text-sm text-gray-500">
            {getDurationSinceDate(post.createdAt)}
          </span>
        </p>
        <div className="absolute -top-1 right-0">
          <PostMenu
            isPublished={post.isPublished}
            postId={post.id}
            onEdit={() =>
              router.push(`/${post.authorUsername}/${post.slug}/edit`)
            }
            onPublish={invalidatePost}
            onUnpublish={invalidatePost}
            onDelete={() => {
              invalidatePost();
              router.push("/");
            }}
          />
        </div>
      </div>
      <Link href={`/${post.authorUsername}/${post.slug}`}>
        <div className="prose">
          <h2 className="group-hover:text-rose-400">{post.title}</h2>
        </div>
      </Link>
    </div>
  );
};
