import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL!;
        const adminPassword = process.env.ADMIN_PASSWORD!;

        if (credentials.email !== adminEmail) return null;

        // Support both plain-text (initial setup) and bcrypt-hashed passwords
        const valid =
          adminPassword.startsWith("$2") // bcrypt hash
            ? await bcrypt.compare(credentials.password, adminPassword)
            : credentials.password === adminPassword; // plain-text fallback

        if (!valid) return null;

        return { id: "1", email: adminEmail, name: "Admin" };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
