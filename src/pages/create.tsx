import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from "react-hook-form";
import { TbArrowLeft } from "react-icons/tb";
import { useQueryClient } from "react-query";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { NoSSR } from "../components/NoSSR";
import { trpc } from "../utils/trpc";

const createPostSchema = z.object({
  title: z.string().min(1, "A title is required.").max(300),
  content: z.string().min(1, "Make sure to write something!"),
  shouldPublishImmediately: z.boolean().default(false),
});

type CreatePostSchemaType = z.infer<typeof createPostSchema>;
const Create = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { register, handleSubmit, watch, formState, setError } =
    useForm<CreatePostSchemaType>({
      resolver: zodResolver(createPostSchema),
      reValidateMode: "onChange",
    });

  const { mutate: createPost, isLoading: isPublishing } = trpc.useMutation(
    "post.create",
    {
      onSuccess: (data) => {
        if (data) {
          queryClient.invalidateQueries("post.getPosts");
          router.push(`/${data.authorUsername}/${data.slug}`);
        }
      },
      onError: (error) => {
        if (error.data?.code === "BAD_REQUEST") {
          setError("title", {
            message: error.message,
          });
        }
      },
    }
  );

  const onSubmit: SubmitHandler<CreatePostSchemaType> = ({
    content,
    shouldPublishImmediately,
    title,
  }) => {
    createPost({
      content,
      shouldPublishImmediately,
      title,
    });
  };

  return (
    <NoSSR>
      <Layout>
        <header className="flex items-center gap-4">
          <Link href="/">
            <button className="group flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors duration-100 hover:bg-rose-200 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-opacity-75">
              <TbArrowLeft
                className="text-gray-500 transition-colors duration-100 group-hover:text-rose-400"
                aria-hidden="true"
              />
            </button>
          </Link>
          <h1 className="text-2xl font-bold leading-none">
            {" "}
            Create a new post
          </h1>
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isPublishing}>
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
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-rose-500 focus:ring-rose-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-rose-500 dark:focus:ring-rose-500"
                {...register("title")}
              />
              {!!formState.errors?.title && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  <span className="font-medium">Oops! </span>
                  {formState.errors.title.message}
                </p>
              )}
            </div>

            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400"
            >
              Content
            </label>
            <textarea
              id="content"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-rose-500 focus:ring-rose-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-rose-500 dark:focus:ring-rose-500"
              rows={10}
              placeholder="What are you feeling today?"
              {...register("content")}
            ></textarea>
            {!!formState.errors?.content && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">Oops! </span>
                {formState.errors.content.message}
              </p>
            )}

            <div className="block">
              <label
                htmlFor="set-is-published-toggle"
                className="relative mt-6 inline-flex cursor-pointer items-center"
              >
                <input
                  type="checkbox"
                  id="set-is-published-toggle"
                  className="peer sr-only"
                  {...register("shouldPublishImmediately")}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-rose-300 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-200 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-rose-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Publish immediately
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="my-6 rounded-lg bg-rose-300 px-4 py-2 text-center text-sm font-medium text-black hover:bg-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:opacity-50 hover:disabled:opacity-50 dark:bg-rose-400 dark:hover:bg-rose-500 dark:focus:ring-rose-900"
            >
              {watch("shouldPublishImmediately") ? "Publish" : "Save as draft"}
            </button>
          </fieldset>
        </form>
      </Layout>
    </NoSSR>
  );
};

export default Create;
