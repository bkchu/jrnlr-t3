import Link from "next/link";
import { useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import { TbArrowLeft } from "react-icons/tb";
import { useQueryClient } from "react-query";
import { Layout } from "../components/Layout";
import { trpc } from "../utils/trpc";

const Create = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutateAsync: createPost } = trpc.useMutation("post.create", {
    onSuccess: () => {
      queryClient.invalidateQueries("post.getPosts");
      router.push("/");
    },
  });
  const [shouldPublishImmediately, setShouldPublishImmediately] =
    useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> | undefined = (e) => {
    e.preventDefault();
    createPost({
      content,
      shouldPublishImmediately,
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
        <h1 className="text-2xl font-bold leading-none"> Create a new post</h1>
      </header>
      <form onSubmit={handleSubmit}>
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

        <div className="block">
          <label
            htmlFor="set-is-published-toggle"
            className="relative mt-6 inline-flex cursor-pointer items-center"
          >
            <input
              type="checkbox"
              checked={shouldPublishImmediately}
              onChange={(e) => setShouldPublishImmediately(e.target.checked)}
              id="set-is-published-toggle"
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-200 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-red-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Publish immediately
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="my-6 rounded-lg bg-red-300 px-4 py-2 text-center text-sm font-medium text-black hover:bg-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 dark:bg-red-400 dark:hover:bg-red-500 dark:focus:ring-red-900"
        >
          {shouldPublishImmediately ? "Publish" : "Save as draft"}
        </button>
      </form>
    </Layout>
  );
};

export default Create;
