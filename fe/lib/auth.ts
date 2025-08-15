import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaClient } from "../../backend/prisma/generated/prisma";
import type {
  Session as NextAuthSession,
  User as NextAuthUser,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Account } from "next-auth";

const prisma = new PrismaClient();

type SessionUserWithId = NextAuthUser & {
  id?: string;
  premium?: boolean;
};

export const NEXT_AUTH = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    session: async ({
      session,
    }: {
      session: NextAuthSession;
      token: JWT;
      user?: NextAuthUser;
    }) => {
      if (session && session.user && session.user.email) {
        try {
          // Fetch user from database to get the actual user ID
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, email: true, premium: true },
          });

          if (dbUser) {
            // Add database user ID and other info to session
            const userWithId = session.user as SessionUserWithId;
            userWithId.id = dbUser.id;
            userWithId.premium = dbUser.premium;
            session.user.name = dbUser.name;
          }
        } catch (error) {
          console.error("Error fetching user from database:", error);
        }
      }
      return session;
    },
    async signIn({
      user,
      account,
    }: {
      user: NextAuthUser;
      account: Account | null;
    }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          if (!user.email) {
            // Email is required for authentication
            return false;
          }

          // Check if user exists in DB
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create user in DB
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "Anonymouse user",
              },
            });
            console.log(
              `New user created: ${user.email} via ${account.provider}`
            );
          } else {
            console.log(
              `Existing user signed in: ${user.email} via ${account.provider}`
            );
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
