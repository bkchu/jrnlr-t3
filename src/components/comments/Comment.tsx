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
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = trpc.useQuery(["auth.getSession"]);
  const utils = trpc.useContext();

  const { mutate: deleteComment } = trpc.useMutation("comment.delete", {
    onSuccess() {
      utils.invalidateQueries("comment.get-comments-by-post-id");
    },
  });

  return (
    <div className="relative isolate pt-4">
      {/* left line */}
      {comment.children.length > 0 && (
        <div className="absolute top-[52px] bottom-0 ml-[15px] border-l-2 border-l-red-100"></div>
      )}

      {/* actual comment */}
      <div className="flex py-1">
        <Image
          className="h-8 w-8 rounded-full object-cover"
          src={comment.author.image ?? ""}
          alt={comment.author.name ?? ""}
          width={32}
          height={32}
        />
        <div className="ml-3 flex-1">
          <div className="">
            <p className="text-sm font-semibold">{comment.author.name}</p>

            <div className="flex items-center">
              {/* the little dot */}
              {/* <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span> */}

              {/* the time passed since createdAt */}
              <span className="text-xs text-gray-500">
                {getDurationSinceDate(comment.createdAt)}
              </span>
              {/* show edited status */}
              {comment.updatedAt > comment.createdAt ? (
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
                    onDelete={function (): void {
                      throw new Error("Function not implemented.");
                    }}
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
              <div className="mt-1 text-sm text-gray-800">
                {comment.content}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setIsReplying(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-700 transition-colors duration-100 hover:bg-red-100"
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
                {session?.user.id === comment.authorId && (
                  <button
                    onClick={() =>
                      deleteComment({
                        commentId: comment.id,
                      })
                    }
                    className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-700 transition-colors duration-100 hover:bg-red-500 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-3 w-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>

                    <span>Delete</span>
                  </button>
                )}
              </div>
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
