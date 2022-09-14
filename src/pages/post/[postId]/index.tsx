import Link from "next/link";
import { useRouter } from "next/router";
import { CommentLoader } from "../../../components/comments/CommentLoader";
import { CommentsSection } from "../../../components/comments/CommentsSection";
import { Layout } from "../../../components/Layout";
import { Post } from "../../../components/Post";
import { PostLoader } from "../../../components/PostLoader";
import { inferQueryOutput, trpc } from "../../../utils/trpc";

type PostGetPostResponse = inferQueryOutput<"post.get-post">;

const PostPage = () => {
  const router = useRouter();

  const { data: post, isLoading: isLoadingPost } = trpc.useQuery([
    "post.get-post",
    { postId: router.query.postId as string },
  ]);

  const { isLoading: isLoadingComments } = trpc.useQuery([
    "comment.get-comments-by-post-id",
    {
      postId: router.query.postId as string,
    },
  ]);

  return (
    <Layout>
      <Link href="/">
        <nav className="group flex w-fit cursor-pointer items-center gap-1 rounded-md pr-2 text-white transition-colors duration-100 hover:bg-red-200 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-opacity-75">
          <button className="flex h-8 w-8 items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-gray-500 transition-colors duration-100 group-hover:text-red-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
              />
            </svg>
          </button>
          <p className="block text-sm leading-none text-gray-500 transition-colors duration-100 group-hover:text-red-400">
            Back
          </p>
        </nav>
      </Link>

      {isLoadingPost ? (
        <PostLoader />
      ) : (
        <Post post={(post ?? {}) as PostGetPostResponse} />
      )}

      <hr className="border border-[#FFD8D8]" />

      {isLoadingComments ? <CommentLoader /> : <CommentsSection />}
    </Layout>
  );
};

export default PostPage;
