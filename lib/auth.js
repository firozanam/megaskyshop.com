import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { getDatabase } from '@/lib/mongodb'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const db = await getDatabase()
        const user = await db.collection("users").findOne({ email: credentials.email })

        if (!user || !(await compare(credentials.password, user.password))) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin || false,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}
