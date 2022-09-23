import { inferQueryOutput } from "../../utils/trpc";
import { Comment } from "./Comment";

type Comments = inferQueryOutput<"comment.get-comments-by-post-id">["roots"];

type CommentsProps = {
  comments: Comments;
  depth?: number;
};

export const Comments = ({ comments, depth }: CommentsProps) => {
  return (
    <>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} depth={(depth ?? 0) + 1} />
      ))}
    </>
  );
};
