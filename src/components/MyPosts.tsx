import { Post } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import { getDurationSinceDate } from "../utils/date";
import { trpc } from "../utils/trpc";
import { Menu } from "./Menu";

export const MyPosts = ({ posts }: { posts: Post[] }) => (
  <>
    {posts.map((post) => (
      <MyPost key={post.id} post={post} />
    ))}
  </>
);

export const MyPost = ({ post }: { post: Post }) => {
  const utils = trpc.useContext();
  const invalidatePost = () =>
    utils.invalidateQueries(["post.get-posts.my-posts"]);
  return (
    <div className="group my-8 cursor-pointer">
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
          <Menu
            isPublished={post.isPublished}
            postId={post.id}
            onPublish={invalidatePost}
            onUnpublish={invalidatePost}
            onDelete={invalidatePost}
          />
        </div>
      </div>
      <Link href={`/post/${post.id}`}>
        <div className="prose">
          <h2 className="group-hover:text-rose-400">{post.title}</h2>
        </div>
      </Link>
    </div>
  );
};
