import { trpc } from "../../utils/trpc";
import { Menu } from "../Menu";

type PostMenuProps = {
  postId: number;
  isPublished: boolean;
  onEdit?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onDelete?: () => void;
};

export const PostMenu = ({
  postId,
  isPublished,
  onEdit,
  onPublish,
  onUnpublish,
  onDelete,
}: PostMenuProps) => {
  const { mutateAsync: publishPost } = trpc.useMutation("post.publish", {
    onSuccess: () => {
      onPublish?.();
    },
  });

  const { mutateAsync: unpublishPost } = trpc.useMutation("post.unpublish", {
    onSuccess: () => {
      onUnpublish?.();
    },
  });

  const { mutateAsync: deletePost } = trpc.useMutation("post.delete", {
    onSuccess: () => {
      onDelete?.();
    },
  });

  return (
    <Menu
      triggerButton={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 text-gray-500 transition-colors duration-100 group-hover:text-rose-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
      }
    >
      <Menu.Button
        variant="primary"
        onClick={() =>
          isPublished ? unpublishPost({ postId }) : publishPost({ postId })
        }
      >
        {({ active }) => (
          <>
            {isPublished ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`mr-2 h-5 w-5 ${
                  active ? "text-white" : "text-black"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`mr-2 h-5 w-5 ${
                  active ? "text-white" : "text-black"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
            )}
            {isPublished ? "Unpublish" : "Publish"}
          </>
        )}
      </Menu.Button>
      <Menu.Button onClick={() => onEdit?.()}>
        {({ active }) => (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`mr-2 h-5 w-5 ${active ? "text-white" : "text-black"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Edit
          </>
        )}
      </Menu.Button>
      <Menu.Button
        variant="destructive"
        onClick={() => deletePost?.({ postId })}
      >
        {({ active }) => (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`mr-2 h-5 w-5 ${
                active ? "text-white" : "text-rose-400"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Delete
          </>
        )}
      </Menu.Button>
    </Menu>
  );
};
