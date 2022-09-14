import clsx from "clsx";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TbPlus } from "react-icons/tb";
import { Layout } from "../components/Layout";
import { MyFeed } from "../components/MyFeed";
import { MyPosts } from "../components/MyPosts";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const {
    isLoading,
    isFetching,
    data: session,
  } = trpc.useQuery(["auth.getSession"]);

  const [isMyPosts, setIsMyPosts] = useState(false);

  const { isLoading: isLoadingMyPosts, data: myPosts } = trpc.useQuery(
    ["post.get-posts.my-posts"],
    {
      enabled: isMyPosts,
    }
  );

  const { isLoading: isLoadingFeed, data: feedPosts } = trpc.useQuery(
    ["post.get-posts.feed"],
    {
      enabled: !isMyPosts,
    }
  );

  const activeTabStyle = "bg-red-200 font-bold";

  return (
    <>
      <Head>
        <title>Jrnlr - T3</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <header>
          {!!session ? (
            <div className="flex items-center">
              <div className="mr-3 h-12">
                <Image
                  className="rounded-full"
                  src={session?.user?.image ?? ""}
                  alt={session?.user?.name ?? ""}
                  width={48}
                  height={48}
                />
              </div>
              <p className="text-2xl font-bold leading-none">Home</p>
              {/* <button onClick={() => signOut()}>Sign Out</button> */}
            </div>
          ) : isLoading && isFetching ? (
            "loading..."
          ) : (
            <button onClick={() => signIn("google")}>Sign In</button>
          )}
        </header>

        <nav className="mt-5 flex rounded-[10px] border border-red-200 p-px">
          <button
            className={clsx(
              "h-8 flex-1 rounded-lg text-gray-800",
              !isMyPosts && activeTabStyle
            )}
            onClick={() => setIsMyPosts(false)}
          >
            Feed
          </button>
          <button
            className={clsx(
              "h-8 flex-1 rounded-lg text-gray-800",
              isMyPosts && activeTabStyle
            )}
            onClick={() => setIsMyPosts(true)}
          >
            My Posts
          </button>
        </nav>

        <main className="container mx-auto mt-4">
          {isLoadingMyPosts || isLoadingFeed ? (
            <p>Loading posts...</p>
          ) : isMyPosts && myPosts ? (
            <MyPosts posts={myPosts} />
          ) : !isMyPosts && feedPosts ? (
            <MyFeed posts={feedPosts} />
          ) : null}
        </main>

        <Link href="/create">
          <button className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-200 text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </Link>
      </Layout>
    </>
  );
};

export default Home;
