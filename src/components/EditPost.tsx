import Link from "next/link";
import { useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import { TbArrowLeft } from "react-icons/tb";
import { useQueryClient } from "react-query";
import { Layout } from "./Layout";
import { trpc } from "../utils/trpc";

export const EditPost = ({ postId }: { postId: string }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const { isLoading } = trpc.useQuery(["post.get-post", { postId }], {
    onSuccess: (data) => {
      setTitle(data.title);
      setContent(data.content);
    },
  });

  const { mutateAsync: editPost } = trpc.useMutation("post.edit", {
    onSuccess: () => {
      queryClient.invalidateQueries("post.getPosts");
      router.push("/");
    },
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> | undefined = (e) => {
    e.preventDefault();
    editPost({
      postId,
      content,
      title,
    });
  };

  return (
    <Layout>
      <header className="flex items-center gap-4">
        <Link href="/">
          <button className="group flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors duration-100 hover:bg-red-200 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-opacity-75">
            <TbArrowLeft
              className="text-gray-500 transition-colors duration-100 group-hover:text-red-400"
              aria-hidden="true"
            />
          </button>
        </Link>
        <h1 className="text-2xl font-bold leading-none">Edit</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading}>
          <div className="my-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Title"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-red-500 dark:focus:ring-red-500"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </div>
          <label
            htmlFor="content"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400"
          >
            Content
          </label>
          <textarea
            id="content"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-red-500 dark:focus:ring-red-500"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you feeling today?"
          ></textarea>
          <button
            type="submit"
            className="my-6 rounded-full bg-red-300 px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 dark:bg-red-400 dark:hover:bg-red-500 dark:focus:ring-red-900"
          >
            Update Post
          </button>
        </fieldset>
      </form>
    </Layout>
  );
};
