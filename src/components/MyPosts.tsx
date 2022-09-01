import { Post } from "@prisma/client";
import clsx from "clsx";
import { getDurationSinceDate } from "../utils/date";
import { Menu } from "./Menu";

export const MyPosts = ({ posts }: { posts: Post[] }) => (
  <>
    {posts.map((post) => (
      <MyPost key={post.id} post={post} />
    ))}
  </>
);

export const MyPost = ({ post }: { post: Post }) => (
  <div className="my-8">
    <div className="flex items-center justify-between">
      <p className="flex items-center">
        {/* the pill showing published/unpublished */}
        <span
          className={clsx(
            "inline-block rounded-full py-1 px-2 text-xs font-bold uppercase",
            {
              "bg-gray-200": !post.isPublished,
              "bg-red-200": post.isPublished,
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
      <Menu isPublished={post.isPublished} postId={post.id} />
    </div>
    <h2 className="text-lg font-bold">{post.title}</h2>
    <div>{`${post.content.slice(0, 300)}${
      post.content.length > 300 ? "..." : ""
    }`}</div>
  </div>
);
