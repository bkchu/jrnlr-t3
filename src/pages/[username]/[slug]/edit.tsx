import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { SubmitHandler, useForm } from "react-hook-form";
import { TbArrowLeft } from "react-icons/tb";
import { useQueryClient } from "react-query";
import { z } from "zod";
import { Layout } from "../../../components/Layout";
import NoSSR from "../../../components/NoSSR";
import { trpc } from "../../../utils/trpc";

const editPostSchema = z.object({
  title: z.string().min(1, "A title is required.").max(300),
  content: z.string().min(1, "Make sure to write something!"),
});

type EditPostSchemaType = z.infer<typeof editPostSchema>;

const Edit = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState, setError, setValue, reset } =
    useForm<EditPostSchemaType>({
      resolver: zodResolver(editPostSchema),
      reValidateMode: "onChange",
    });

  const router = useRouter();

  const { data: post, isLoading } = trpc.useQuery(
    [
      "post.get-post",
      {
        authorUsername: router.query.username as string,
        postSlug: router.query.slug as string,
      },
    ],
    {
      onSuccess: (data) => {
        if (!formState.isDirty) {
          setValue("title", data.title);
          setValue("content", data.content);
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

  const { mutate: editPost } = trpc.useMutation("post.edit", {
    onSuccess: (editedPost) => {
      queryClient.invalidateQueries("post.getPosts");
      router.push(
        `/${editedPost?.authorUsername as string}/${editedPost?.slug as string}`
      );
    },
    onError: (error) => {
      if (error.data?.code === "BAD_REQUEST") {
        setError("title", {
          message: error.message,
        });
      }
    },
  });

  const onSubmit: SubmitHandler<EditPostSchemaType> = ({ content, title }) => {
    editPost({
      postId: post?.id as string,
      content,
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
          <h1 className="text-2xl font-bold leading-none">Edit</h1>
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              placeholder="What are you feeling today?"
              rows={4}
              {...register("content")}
            ></textarea>
            {!!formState.errors?.content && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                <span className="font-medium">Oops! </span>
                {formState.errors.content.message}
              </p>
            )}
            <button
              type="submit"
              className="my-6 rounded-full bg-rose-300 px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100 dark:bg-rose-400 dark:hover:bg-rose-500 dark:focus:ring-rose-900"
            >
              Update Post
            </button>
          </fieldset>
        </form>
      </Layout>
    </NoSSR>
  );
};

export default Edit;
