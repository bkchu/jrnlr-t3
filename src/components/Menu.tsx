import { Menu as HeadlessUiMenu, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { TbDotsVertical, TbFileExport, TbTrash, TbEdit } from "react-icons/tb";
import { trpc } from "../utils/trpc";

export const Menu = ({
  postId,
  isPublished,
}: {
  postId: string;
  isPublished: boolean;
}) => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { mutateAsync: publishPost } = trpc.useMutation("post.publish", {
    onSuccess: () => {
      utils.invalidateQueries(["post.get-posts.feed"]);
      utils.invalidateQueries(["post.get-posts.my-posts"]);
    },
  });
  const { mutateAsync: unpublishPost } = trpc.useMutation("post.unpublish", {
    onSuccess: () => {
      utils.invalidateQueries(["post.get-posts.feed"]);
      utils.invalidateQueries(["post.get-posts.my-posts"]);
    },
  });
  const { mutateAsync: deletePost } = trpc.useMutation("post.delete", {
    onSuccess: () => {
      utils.invalidateQueries(["post.get-posts.feed"]);
      utils.invalidateQueries(["post.get-posts.my-posts"]);
    },
  });
  return (
    <HeadlessUiMenu as="div" className="relative inline-block text-left">
      <div>
        <HeadlessUiMenu.Button className="group flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors duration-100 hover:bg-pink-200 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <TbDotsVertical
            className="text-gray-500 transition-colors duration-100 group-hover:text-pink-500"
            aria-hidden="true"
          />
        </HeadlessUiMenu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessUiMenu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            <HeadlessUiMenu.Item>
              {({ active }) => (
                <button
                  onClick={() =>
                    isPublished
                      ? unpublishPost({ postId })
                      : publishPost({ postId })
                  }
                  className={`${
                    active ? "bg-red-400 text-white" : "bg-red-200 text-black"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors duration-100`}
                >
                  <TbFileExport
                    className={`mr-2 h-5 w-5 ${
                      active ? "text-white" : "text-black"
                    }`}
                    aria-hidden="true"
                  />
                  {isPublished ? "Unpublish" : "Publish"}
                </button>
              )}
            </HeadlessUiMenu.Item>
          </div>
          <div className="px-1 py-1">
            <HeadlessUiMenu.Item>
              {({ active }) => (
                <button
                  onClick={() => router.push(`/post/${postId}/edit`)}
                  className={`${
                    active ? "bg-red-400 text-white" : "bg-white text-black"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors duration-100`}
                >
                  <TbEdit
                    className={`mr-2 h-5 w-5 ${
                      active ? "text-white" : "text-black"
                    }`}
                    aria-hidden="true"
                  />
                  Edit
                </button>
              )}
            </HeadlessUiMenu.Item>
          </div>
          <div className="px-1 py-1">
            <HeadlessUiMenu.Item>
              {({ active }) => (
                <button
                  onClick={() => deletePost({ postId })}
                  className={`${
                    active ? "bg-red-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors duration-100`}
                >
                  <TbTrash
                    className={`mr-2 h-5 w-5 ${
                      active ? "text-white" : "text-red-400"
                    }`}
                    aria-hidden="true"
                  />
                  Delete
                </button>
              )}
            </HeadlessUiMenu.Item>
          </div>
        </HeadlessUiMenu.Items>
      </Transition>
    </HeadlessUiMenu>
  );
};
