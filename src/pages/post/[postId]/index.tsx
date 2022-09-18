import { createSSGHelpers } from "@trpc/react/ssg";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import Link from "next/link";
import superjson from "superjson";
import { CommentLoader } from "../../../components/comments/CommentLoader";
import { CommentsSection } from "../../../components/comments/CommentsSection";
import { Layout } from "../../../components/Layout";
import { Post } from "../../../components/Post";
import { PostLoader } from "../../../components/PostLoader";
import { prisma } from "../../../server/db/client";
import { appRouter } from "../../../server/router";
import { inferQueryOutput, trpc } from "../../../utils/trpc";
import { authOptions } from "../../api/auth/[...nextauth]";

type PostGetPostResponse = inferQueryOutput<"post.get-post">;

export const getServerSideProps: GetServerSideProps<{
  postId: string;
}> = async ({ params, req, res }) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: { session, prisma },
    transformer: superjson, // optional - adds superjson serialization
  });

  const postId = params?.postId as string;

  await ssg.fetchQuery("post.get-post", {
    postId,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId,
    },
  };
};

const PostPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { data: post, isLoading: isLoadingPost } = trpc.useQuery([
    "post.get-post",
    { postId: props.postId },
  ]);

  const { isLoading: isLoadingComments } = trpc.useQuery([
    "comment.get-comments-by-post-id",
    { postId: props.postId },
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
