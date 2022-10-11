import { motion } from "framer-motion";
import { signIn, signOut } from "next-auth/react";
import Image from "next/future/image";
import Link from "next/link";
import { ReactNode } from "react";
import { trpc } from "../utils/trpc";
import { Menu } from "./Menu";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { data: session } = trpc.useQuery(["auth.getSession"], {
    enabled: false,
  });
  return (
    <>
      <header className="fixed top-0 z-10 w-screen rounded-b-3xl bg-rose-50 shadow-md">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2">
          <Link href="/">
            <h1 className="cursor-pointer bg-gradient-to-r from-rose-400 to-pink-600 bg-clip-text text-3xl font-extrabold text-transparent">
              JRNLR
            </h1>
          </Link>
          {!!session ? (
            <div className="flex items-center gap-2">
              <p className="text-right text-sm font-bold uppercase leading-none tracking-wide text-gray-900">
                Hey, {session?.user?.givenName}
              </p>
              <motion.div
                role="button"
                className="relative h-8 cursor-pointer rounded-full"
                initial="initial"
                whileHover="active"
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-rose-300"
                  variants={{
                    initial: {
                      opacity: 0,
                      scale: 1,
                    },
                    active: {
                      opacity: 1,
                      scale: 1.25,
                      filter: "blur(4px)",
                    },
                  }}
                  transition={{
                    type: "tween",
                    ease: "backInOut",
                    duration: 0.2,
                  }}
                ></motion.div>
                <Menu
                  triggerButton={
                    <Image
                      className="relative h-full w-full rounded-full"
                      src={session?.user?.image ?? ""}
                      alt={session?.user?.name ?? ""}
                      width={48}
                      height={48}
                    />
                  }
                >
                  <Menu.Button variant="primary" onClick={signOut}>
                    {() => <p>Sign Out</p>}
                  </Menu.Button>
                </Menu>
              </motion.div>
            </div>
          ) : (
            <button
              className="text-bold rounded-lg bg-gradient-to-br from-rose-300 to-pink-300 px-4 py-2"
              onClick={() => signIn("google")}
            >
              Sign In
            </button>
          )}
        </div>
      </header>
      <div className="container mx-auto p-4 pt-16">{children}</div>
    </>
  );
};
