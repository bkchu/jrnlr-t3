import { Menu as HeadlessUiMenu, Transition } from "@headlessui/react";
import { Fragment } from "react";

type CommentMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export const CommentMenu = ({ onEdit, onDelete }: CommentMenuProps) => {
  return (
    <HeadlessUiMenu as="div" className="relative inline-block text-left">
      <div>
        <HeadlessUiMenu.Button className="group flex h-6 w-6 items-center justify-center rounded-md text-white transition-colors duration-100 hover:bg-rose-200 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-3 w-3 text-gray-500 transition-colors duration-100 group-hover:text-rose-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
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
        <HeadlessUiMenu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            <HeadlessUiMenu.Item>
              {({ active }) => (
                <button
                  onClick={onEdit}
                  className={`${
                    active ? "bg-rose-400 text-white" : "bg-white text-black"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors duration-100`}
                >
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
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                  Edit
                </button>
              )}
            </HeadlessUiMenu.Item>
          </div>
          <div className="px-1 py-1">
            <HeadlessUiMenu.Item>
              {({ active }) => (
                <button
                  onClick={onDelete}
                  className={`${
                    active ? "bg-rose-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors duration-100`}
                >
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
                </button>
              )}
            </HeadlessUiMenu.Item>
          </div>
        </HeadlessUiMenu.Items>
      </Transition>
    </HeadlessUiMenu>
  );
};
