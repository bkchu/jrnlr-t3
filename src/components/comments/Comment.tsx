import clsx from "clsx";
import { differenceInSeconds } from "date-fns";
import Image from "next/future/image";
import pluralize from "pluralize";
import { useState } from "react";
import { animated } from "react-spring";
import { useGrowBoop } from "../../hooks/useBoop";
import { getDurationSinceDate } from "../../utils/date";
import { inferQueryOutput, trpc } from "../../utils/trpc";
import { FadeIn } from "../FadeIn";
import { NoSSR } from "../NoSSR";
import { AddCommentForm } from "./AddCommentForm";
import { CommentMenu } from "./CommentMenu";
import { Comments } from "./Comments";
import { EditCommentForm } from "./EditCommentForm";

export const Comment = ({
  comment,
  depth,
}: {
  comment: ArrayElement<
    inferQueryOutput<"comment.get-comments-by-post-id">["roots"]
  >;
  depth: number;
}) => {
  const utils = trpc.useContext();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [growStyle, growTrigger] = useGrowBoop();

  const invalidateComments = () =>
    utils.invalidateQueries([
      "comment.get-comments-by-post-id",
      { postId: comment.postId },
    ]);

  const { mutate: like } = trpc.useMutation("comment.like", {
    onSuccess: invalidateComments,
  });
  const { mutate: unlike } = trpc.useMutation("comment.unlike", {
    onSuccess: invalidateComments,
  });

  const { data: session } = trpc.useQuery(["auth.getSession"], {
    enabled: false,
  });

  const toggleLike = () => {
    growTrigger();
    if (comment.liked) {
      unlike({
        commentId: comment.id,
      });
    } else {
      like({
        commentId: comment.id,
      });
    }
  };

  const { mutate: deleteComment } = trpc.useMutation("comment.delete", {
    onSuccess() {
      utils.invalidateQueries("comment.get-comments-by-post-id");
    },
  });

  const borderDepthColorMap = clsx({
    "border-rose-100": depth % 9 === 1,
    "border-rose-200": depth % 9 === 2,
    "border-rose-300": depth % 9 === 3,
    "border-rose-400": depth % 9 === 4,
    "border-rose-500": depth % 9 === 5,
    "border-rose-600": depth % 9 === 6,
    "border-rose-700": depth % 9 === 7,
    "border-rose-800": depth % 9 === 8,
    "border-rose-900": depth % 9 === 0,
  });

  return (
    <div className="relative isolate pt-4">
      {/* left line */}
      <div
        className={clsx(
          "absolute top-9 -left-2 bottom-0 right-full -z-10",
          borderDepthColorMap,
          "rounded-l-md border-t-2 border-l-2 border-b-2"
        )}
      />

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
          <div className="flex items-center">
            {/* author's username */}
            {comment.author?.username && (
              <>
                <p className="text-sm font-semibold">
                  {comment.author?.username}
                </p>
                {/* the little dot */}
                <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>
              </>
            )}

            {/* the time passed since createdAt */}
            <span className="text-sm text-gray-500">
              {getDurationSinceDate(comment.createdAt)}
            </span>
            {/* show edited status */}
            {differenceInSeconds(comment.updatedAt, comment.createdAt) > 1 &&
            !!comment.author ? (
              <>
                {/* the little dot */}
                <span className="mx-2 inline-block h-1 w-1 rounded-full bg-gray-500"></span>
                <span className="text-sm text-gray-500">Edited</span>
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

          {isEditing ? (
            <EditCommentForm
              initialComment={comment}
              onClose={() => setIsEditing(false)}
            />
          ) : (
            <>
              {comment.content ? (
                <p className="mt-1 text-sm text-gray-800">{comment.content}</p>
              ) : (
                <p className="mt-1 mb-6 text-sm text-gray-800">
                  <span className="italic">This comment was deleted.</span>
                </p>
              )}
              {comment.author && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={toggleLike}
                    className="flex cursor-pointer items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-sm text-gray-700 transition-colors duration-100 hover:bg-rose-100"
                  >
                    <NoSSR>
                      <animated.svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={growStyle}
                        className={clsx("h-4 w-4 duration-75", {
                          "fill-rose-400 stroke-rose-500": comment.liked,
                        })}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </animated.svg>
                    </NoSSR>
                    <p className="text-sm text-gray-700">
                      {pluralize("like", comment._count.likes, true)}
                    </p>
                  </button>
                  <button
                    onClick={() => setIsReplying(true)}
                    className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-700 transition-colors duration-100 hover:bg-rose-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4 -rotate-90"
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
        // <div className={clsx(depth <= 9 && "ml-1 pl-1 pb-2")}>
        <div className={clsx("ml-1 pl-1 pb-2")}>
          <Comments comments={comment.children} depth={depth} />
        </div>
      ) : null}
    </div>
  );
};
