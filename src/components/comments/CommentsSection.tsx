import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { AddCommentForm } from "./AddCommentForm";
import { Comments } from "./Comments";

export const CommentsSection = () => {
  const router = useRouter();
  const postId = router.query.postId as string;

  const { data: comments } = trpc.useQuery([
    "comment.get-comments-by-post-id",
    {
      postId,
    },
  ]);

  return (
    <>
      <AddCommentForm />
      <h2 className="text-md mt-4">Comments ({comments?.count})</h2>
      <div className="pb-4">
        <Comments comments={comments?.roots ?? []} />
      </div>
    </>
  );
};
