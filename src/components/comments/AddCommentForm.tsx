import Image from "next/future/image";
import { useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import { trpc } from "../../utils/trpc";
import { FadeIn } from "../FadeIn";

type AddCommentFormProps = {
  isReply?: boolean;
  onClose?: () => void;
  parentId?: string;
};

export const AddCommentForm = ({
  isReply = false,
  onClose,
  parentId,
}: AddCommentFormProps) => {
  const [comment, setComment] = useState("");
  const utils = trpc.useContext();
  const router = useRouter();
  const postId = router.query.postId as string;
  const { data: session } = trpc.useQuery(["auth.getSession"], {
    enabled: false,
  });

  const onSubmit: FormEventHandler<HTMLFormElement> | undefined = (e) => {
    e.preventDefault();
    addComment({
      content: comment,
      postId,
      parentId,
    });
  };

  const { mutate: addComment } = trpc.useMutation("comment.add-comment", {
    onSuccess: () => {
      utils.invalidateQueries("comment.get-comments-by-post-id");
      setComment("");
      onClose?.();
    },
  });

  return (
    <div className="mt-4 flex gap-3">
      {session && (
        <Image
          className="h-8 w-8 rounded-full object-cover"
          src={session?.user.image ?? ""}
          alt={session?.user.name ?? ""}
          width={32}
          height={32}
        />
      )}
      <form onSubmit={onSubmit} className="flex-1">
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400"
        >
          {session?.user.name}
        </label>
        <textarea
          id="comment"
          rows={4}
          className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-rose-500 focus:ring-rose-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-rose-500 dark:focus:ring-rose-500"
          placeholder="Leave a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <FadeIn show={!!comment}>
          <button
            type="submit"
            className="mr-2 rounded-lg bg-rose-300 px-4 py-2 text-center text-sm font-medium text-black hover:bg-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100 dark:bg-rose-400 dark:hover:bg-rose-500 dark:focus:ring-rose-900"
          >
            {isReply ? "Reply" : "Add Comment"}
          </button>
        </FadeIn>

        <FadeIn show={(!isReply && !!comment) || isReply}>
          <button
            type="button"
            onClick={() => {
              onClose?.();
              setComment("");
            }}
            className="rounded-lg border border-gray-200 bg-white py-2 px-4 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-rose-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
          >
            Cancel
          </button>
        </FadeIn>
      </form>
    </div>
  );
};
