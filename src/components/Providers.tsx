'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackgroundProvider } from "@/context/BackgroundContext";

import { ThemeSync } from "@/components/ThemeSync";

interface ProvidersProps {
    children: React.ReactNode;
    initialTheme?: string | null;
    initialBgMode?: string | null;
}

export function Providers({ children, initialTheme, initialBgMode }: ProvidersProps) {
    return (
        <SessionProvider>
            <BackgroundProvider initialMode={initialBgMode as any}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ThemeSync initialTheme={initialTheme} />
                    {children}
                </ThemeProvider>
            </BackgroundProvider>
        </SessionProvider>
    );
}
