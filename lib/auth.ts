// lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    {
      id: "orbit",
      name: "Orbit Station",
      type: "oauth",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        url: `${process.env.ORBIT_URL}/api/oauth/authorize`,
        params: { scope: "profile email" },
      },
      token: `${process.env.ORBIT_URL}/api/oauth/token`,
      userinfo: `${process.env.ORBIT_URL}/api/oauth/userinfo`,
      clientId: process.env.ORBIT_CLIENT_ID as string,
      clientSecret: process.env.ORBIT_CLIENT_SECRET as string,
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await logActivity(
          user.id,
          "LOGIN",
          "Session",
          "User Login Success"
        );
      }
    },
  },
  pages: { signIn: "/login" },
};
