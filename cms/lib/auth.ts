import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getRoleForEmail } from '@/lib/adminRoles'

const ALLOWED_DOMAIN = 'touchpulse.nl'

const providers: NextAuthOptions['providers'] = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          hd: ALLOWED_DOMAIN,
          prompt: 'select_account',
        },
      },
    })
  )
}

export const authOptions: NextAuthOptions = {
  providers,
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
        ;(session.user as { role?: string }).role = typeof token.role === 'string' ? token.role : 'editor'
      }
      return session
    },
    async jwt({ token, user, profile }) {
      const email = user?.email ?? token.email ?? (profile as { email?: string } | undefined)?.email
      if (email) {
        token.role = await getRoleForEmail(email)
      }
      return token
    },
  },
}
