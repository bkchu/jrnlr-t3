import { signIn } from "next-auth/react";
import { usePostContext } from "../../contexts/PostContext";
import { trpc } from "../../utils/trpc";
import { AddCommentForm } from "./AddCommentForm";
import { Comments } from "./Comments";

export const CommentsSection = () => {
  const { postId } = usePostContext();
  const { data: session } = trpc.useQuery(["auth.getSession"], {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: comments } = trpc.useQuery([
    "comment.get-comments-by-post-id",
    {
      postId,
    },
  ]);

  return (
    <>
      {session?.user.id ? (
        <AddCommentForm />
      ) : (
        <div
          id="alert-additional-content-1"
          className="my-4 rounded-lg border border-rose-300 bg-rose-50 p-4"
          role="alert"
        >
          <div className="text-sm text-rose-600">
            <button
              className="text-rose-700 underline"
              onClick={() => signIn("google")}
            >
              Sign in
            </button>{" "}
            to leave comments!
          </div>
        </div>
      )}
      <h2 className="text-md mt-4">Comments ({comments?.count})</h2>
      <div className="pb-4 pl-2">
        <Comments comments={comments?.roots ?? []} />
      </div>
    </>
  );
};
