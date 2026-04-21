import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const ALLOWED_DOMAIN = 'touchpulse.nl'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          // Hint the account chooser to show only the org domain
          hd: ALLOWED_DOMAIN,
          prompt: 'select_account',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async signIn({ account, profile }) {
      // Double-check server-side — hd param alone is not trusted security
      const email: string | undefined =
        (profile as { email?: string } | undefined)?.email ??
        (account as { email?: string } | undefined)?.email

      if (!email || !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        return false
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub
      }
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
}
