import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (process.env.NODE_ENV === "production" && !nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET must be configured in production");
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectMongo();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const email = credentials.email.trim().toLowerCase();

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (user.status !== "active") {
          throw new Error("This account has been deactivated");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: nextAuthSecret || "fallback-secret-for-development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
