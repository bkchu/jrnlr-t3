import Head from "next/head";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { trpc } from "../utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { FadeIn } from "../components/FadeIn";
import { useRouter } from "next/router";
import { NoSSR } from "../components/NoSSR";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Please make your username at least 3 characters."),
});

type UsernameSchemaType = z.infer<typeof usernameSchema>;

const Onboarding = () => {
  const router = useRouter();
  const { register, handleSubmit, watch, formState, setError } =
    useForm<UsernameSchemaType>({
      resolver: zodResolver(usernameSchema),
      reValidateMode: "onChange",
    });

  const { mutate: makeUsername } = trpc.useMutation("user.add-username", {
    onSuccess: () => {
      router.push("/");
    },
    onError: (error) => {
      setError("username", { message: error.message });
    },
  });
  const { data: session } = trpc.useQuery(["auth.getSession"], {
    retry: 1,
  });

  const onSubmit: SubmitHandler<UsernameSchemaType> = (data) => {
    if (session?.user?.id) {
      makeUsername({
        userId: session.user.id,
        username: data.username,
      });
    }
  };

  return (
    <>
      <NoSSR>
        <Head>
          <title>Welcome to Jrnlr</title>
        </Head>
        <Layout>
          <main className="prose">
            <h1 className="mt-4 text-4xl">Welcome to Jrnlr!</h1>

            <p>
              Before we get you into your most comfortable journaling experience
              ever, let&apos;s come up with your username!
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Enter your new username
              </label>
              <input
                type="text"
                id="username"
                className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                {...register("username")}
              />
              {!!formState.errors?.username && (
                <p className="mt-2 text-sm text-red-600">
                  <span className="font-medium">Oops! </span>
                  {formState.errors.username.message}
                </p>
              )}
              <FadeIn show={!!watch().username}>
                <button
                  type="submit"
                  className="mr-2 rounded-lg bg-rose-300 px-4 py-2 text-center text-sm font-medium text-black hover:bg-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
                >
                  Create username
                </button>
              </FadeIn>
            </form>
          </main>
        </Layout>
      </NoSSR>
    </>
  );
};

export default Onboarding;
