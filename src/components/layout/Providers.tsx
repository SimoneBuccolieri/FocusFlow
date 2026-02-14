'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { BackgroundProvider, BackgroundMode } from "@/context/BackgroundContext";

import { ThemeSync } from "./ThemeSync";

interface ProvidersProps {
    children: React.ReactNode;
    initialTheme?: string | null;
    initialBgMode?: string | null;
}

export function Providers({ children, initialTheme, initialBgMode }: ProvidersProps) {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
                themes={['light', 'dark', 'forest']}
            >
                <BackgroundProvider initialMode={initialBgMode as BackgroundMode}>
                    <ThemeSync initialTheme={initialTheme} />
                    {children}
                </BackgroundProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
