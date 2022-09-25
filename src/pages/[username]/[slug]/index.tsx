import { createSSGHelpers } from "@trpc/react/ssg";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import superjson from "superjson";
import { CommentLoader } from "../../../components/comments/CommentLoader";
import { CommentsSection } from "../../../components/comments/CommentsSection";
import { Layout } from "../../../components/Layout";
import { Post } from "../../../components/Post";
import { PostLoader } from "../../../components/PostLoader";
import { PostProvider } from "../../../contexts/PostContext";
import { prisma } from "../../../server/db/client";
import { appRouter } from "../../../server/router";
import { inferQueryOutput, trpc } from "../../../utils/trpc";
import { authOptions } from "../../api/auth/[...nextauth]";

type PostGetPostResponse = inferQueryOutput<"post.get-post">;

export const getServerSideProps: GetServerSideProps<{
  postId: string;
  authorUsername: string;
  postSlug: string;
}> = async ({ params, req, res }) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: { session, prisma },
    transformer: superjson, // optional - adds superjson serialization
  });
  const authorUsername = params?.username as string;
  const postSlug = params?.slug as string;

  const post = await ssg.fetchQuery("post.get-post", {
    authorUsername,
    postSlug,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId: post.id,
      authorUsername,
      postSlug,
    },
  };
};

const PostPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { data: session } = trpc.useQuery(["auth.getSession"], {
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: post, isLoading: isLoadingPost } = trpc.useQuery([
    "post.get-post",
    {
      authorUsername: props.authorUsername,
      postSlug: props.postSlug,
    },
  ]);

  const { isLoading: isLoadingComments } = trpc.useQuery([
    "comment.get-comments-by-post-id",
    {
      postId: props.postId,
    },
  ]);

  return (
    <PostProvider initialPostId={props.postId}>
      <Head>
        <title>{post?.title ? `${post.title} - ` : ""}Jrnlr</title>
      </Head>
      <Layout>
        {isLoadingPost ? (
          <PostLoader />
        ) : (
          <Post post={(post ?? {}) as PostGetPostResponse} />
        )}

        <hr className="border border-[#FFD8D8]" />

        {isLoadingComments ? <CommentLoader /> : <CommentsSection />}
      </Layout>
    </PostProvider>
  );
};

export default PostPage;
