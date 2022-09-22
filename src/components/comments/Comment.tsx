import { differenceInSeconds } from "date-fns";
import Image from "next/future/image";
import { useState } from "react";
import { getDurationSinceDate } from "../../utils/date";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import { FadeIn } from "../FadeIn";
import { AddCommentForm } from "./AddCommentForm";
import { CommentMenu } from "./CommentMenu";
import { Comments } from "./Comments";
import { EditCommentForm } from "./EditCommentForm";

export const Comment = ({
  comment,
}: {
  comment: ArrayElement<
    inferQueryOutput<"comment.get-comments-by-post-id">["roots"]
  >;
}) => {
  const utils = trpc.useContext();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = trpc.useQuery(["auth.getSession"], {
    enabled: false,
  });

  const { mutate: deleteComment } = trpc.useMutation("comment.delete", {
    onSuccess() {
      utils.invalidateQueries("comment.get-comments-by-post-id");
    },
  });

  return (
    <div className="relative isolate pt-4">
      {/* left line */}
      {comment.children.length > 0 && (
        <div className="absolute top-[52px] bottom-0 ml-[15px] border-l-2 border-l-rose-100"></div>
      )}

      {/* actual comment */}
      <div className="flex py-1">
        {comment.author ? (
          <Image
            src={comment.author.image ?? ""}
            className="h-8 w-8 rounded-full object-cover"
            alt={comment.author.username ?? ""}
            width={32}
            height={32}
          />
        ) : (
          <svg
            className="h-8 w-8 rounded-full object-cover text-gray-200"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
              clipRule="evenodd"
            ></path>
          </svg>
        )}
        <div className="ml-3 flex-1">
          <div className="">
            <p className="text-sm font-semibold">{comment.author?.username}</p>

            <div className="flex items-center">
              {/* the little dot */}
              {/* <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span> */}

              {/* the time passed since createdAt */}
              <span className="text-xs text-gray-500">
                {getDurationSinceDate(comment.createdAt)}
              </span>
              {/* show edited status */}
              {differenceInSeconds(comment.updatedAt, comment.createdAt) > 1 &&
              !!comment.author ? (
                <>
                  {/* the little dot */}
                  <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>
                  <span className="text-xs text-gray-500">Edited</span>
                </>
              ) : null}
              {session?.user.id === comment.authorId && (
                <div className="ml-auto">
                  <CommentMenu
                    onEdit={() => setIsEditing(true)}
                    onDelete={() =>
                      deleteComment({
                        commentId: comment.id,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <EditCommentForm
              initialComment={comment}
              onClose={() => setIsEditing(false)}
            />
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-800">
                {comment.content ?? (
                  <span className="italic">This comment was deleted.</span>
                )}
              </p>
              {!!comment.author && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setIsReplying(true)}
                    className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-700 transition-colors duration-100 hover:bg-rose-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-3 w-3 -rotate-90"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3"
                      />
                    </svg>
                    <span>Reply</span>
                  </button>
                </div>
              )}
            </>
          )}
          <FadeIn show={isReplying}>
            <div>
              <AddCommentForm
                isReply
                onClose={() => setIsReplying(false)}
                parentId={comment.id}
              />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* indent and show any replies */}
      {comment.children ? (
        <div className="ml-4 pl-4">
          <Comments comments={comment.children ?? []} />
        </div>
      ) : null}
    </div>
  );
};
