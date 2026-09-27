import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      if (!user || !user.password) return null;
      const valid = await bcrypt.compare(credentials.password, user.password);
      if (!valid) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        organizationId: user.organizationId,
      } as any;
    },
  }),
];

// Google sign-in is optional - only enabled if credentials are configured.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // First-time Google sign-in: auto-create a personal organization.
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          const org = await prisma.organization.create({
            data: { name: `${user.name ?? "New"}'s Organization` },
          });
          await prisma.user.create({
            data: { email: user.email, name: user.name, organizationId: org.id },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      const email = (user?.email as string | undefined) ?? (token.email as string | undefined);
      if (email && !("organizationId" in token && token.organizationId)) {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) token.organizationId = dbUser.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).organizationId = token.organizationId;
      }
      return session;
    },
  },
};
