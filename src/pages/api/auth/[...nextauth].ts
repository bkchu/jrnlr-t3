import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = user.username as string;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        // console.log(profile)
        // the keys in this returned object correspond to columns in the Users table
        return {
          name: profile.name,
          givenName: profile.given_name,
          familyName: profile.family_name,
          locale: profile.locale,
          id: profile.sub,
          email: profile.email,
          image: profile.picture,

          // set the username to the email on user creation
          // which will be updated in the onboarding flow
          username: profile.email,
        };
      },
    }),
  ],
};

export default NextAuth(authOptions);
