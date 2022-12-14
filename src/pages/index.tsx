import clsx from "clsx";
import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { MyFeed } from "../components/MyFeed";
import { MyPosts } from "../components/MyPosts";
import { useWindowDimensions } from "../hooks/useWindowDimensions";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { isLoading, data: session } = trpc.useQuery(["auth.getSession"], {
    retry: 1,
  });

  const [isMyPosts, setIsMyPosts] = useState(
    () => !isLoading && !session?.user.id
  );

  const activeTabStyle = "bg-rose-200";

  const { width, height } = useWindowDimensions();

  return (
    <Layout>
      {session?.user.id && (
        <nav className="flex rounded-lg border border-rose-200 p-px">
          <button
            className={clsx(
              "h-8 flex-1 rounded-md text-sm text-gray-900",
              !isMyPosts && activeTabStyle
            )}
            onClick={() => setIsMyPosts(false)}
          >
            Feed
          </button>
          <button
            className={clsx(
              "h-8 flex-1 rounded-md text-sm text-gray-900",
              isMyPosts && activeTabStyle
            )}
            onClick={() => setIsMyPosts(true)}
          >
            My Posts
          </button>
        </nav>
      )}

      <main className="container mx-auto mt-4">
        {/* the key={width/height} is a hack to make the list rerender on screen-size changes
            since the tanstack-virtual doesn't rerender by default
         */}
        {isMyPosts ? (
          <MyPosts key={`${width}${height}`} />
        ) : (
          <MyFeed key={`${width}${height}`} />
        )}
      </main>

      {!!session?.user.id && (
        <Link href="/create">
          <button className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-200 text-black shadow-md">
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
      )}
    </Layout>
  );
};

export default Home;
