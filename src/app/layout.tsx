import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusFlow",
  description: "Boost your productivity with FocusFlow",
  icons: {
    icon: "/favicon.ico",
  },
};

import { Providers } from "@/components/layout/Providers";
import { GlobalBackground } from "@/components/layout/GlobalBackground";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { TimerProvider } from "@/context/TimerContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  let userPrefs: { theme?: string; backgroundMode?: string } = { theme: 'system' };

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { theme: true, backgroundMode: true }
    });
    if (user) {
      userPrefs = { theme: user.theme || 'system', backgroundMode: user.backgroundMode || 'empty' };
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers initialTheme={userPrefs.theme} initialBgMode={userPrefs.backgroundMode}>
          <TimerProvider>
            <GlobalBackground />
            <Navbar />
            <PageTransition>
              {children}
            </PageTransition>
          </TimerProvider>
        </Providers>
      </body>
    </html>
  );
}
