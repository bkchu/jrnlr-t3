import { FormEventHandler, useState } from "react";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import { FadeIn } from "../FadeIn";

type CommentWithChildren = ArrayElement<
  inferQueryOutput<"comment.get-comments-by-post-id">["roots"]
>;

type EditCommentFormProps = {
  initialComment: CommentWithChildren;
  onClose?: () => void;
};

export const EditCommentForm = ({
  initialComment,
  onClose,
}: EditCommentFormProps) => {
  const [comment, setComment] = useState(initialComment.content ?? "");
  const utils = trpc.useContext();

  const { mutate: updateComment } = trpc.useMutation("comment.update", {
    onSuccess: () => {
      utils.invalidateQueries("comment.get-comments-by-post-id");
      setComment("");
      onClose?.();
    },
  });

  const onSubmit: FormEventHandler<HTMLFormElement> | undefined = (e) => {
    e.preventDefault();
    updateComment({
      commentId: initialComment.id,
      content: comment,
    });
  };

  return (
    <div className="mt-4 flex gap-3">
      <form onSubmit={onSubmit} className="flex-1">
        <label
          htmlFor="comment"
          className="sr-only mb-2 text-sm font-medium text-gray-900"
        >
          Update Comment
        </label>
        <textarea
          id="comment"
          rows={4}
          className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-rose-500 focus:ring-rose-500"
          placeholder="Leave a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <FadeIn show={comment !== initialComment.content}>
          <button
            type="submit"
            className="mr-2 rounded-lg bg-rose-300 px-4 py-2 text-center text-sm font-medium text-black hover:bg-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
          >
            Update
          </button>
        </FadeIn>

        <FadeIn show={!!comment}>
          <button
            type="button"
            onClick={() => {
              onClose?.();
              setComment("");
            }}
            className="rounded-lg border border-gray-200 bg-white py-2 px-4 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-rose-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Cancel
          </button>
        </FadeIn>
      </form>
    </div>
  );
};
