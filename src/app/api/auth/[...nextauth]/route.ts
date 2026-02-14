import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth.utils"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user || !user.password) {
                    return null
                }

                const isValid = await verifyPassword(credentials.password, user.password)

                if (!isValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" && profile) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const picture = (profile as any).picture || (profile as any).image;
                    if (picture && user.email) {
                        const existingUser = await prisma.user.findUnique({
                            where: { email: user.email }
                        });

                        if (existingUser && !existingUser.image) {
                            await prisma.user.update({
                                where: { id: existingUser.id },
                                data: { image: picture }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error updating user image on sign in:", error);
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
            }
            // Update token if session is updated
            if (trigger === "update" && session?.name) {
                token.name = session.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
