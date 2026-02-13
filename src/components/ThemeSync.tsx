'use client';

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { updateUserPreferences } from "@/app/actions";

interface ThemeSyncProps {
    initialTheme?: string | null;
}

export function ThemeSync({ initialTheme }: ThemeSyncProps) {
    const { theme, setTheme } = useTheme();
    const isMounted = useRef(false);

    // Initialize from DB if provided
    useEffect(() => {
        if (!isMounted.current && initialTheme && (initialTheme === 'dark' || initialTheme === 'light' || initialTheme === 'system')) {
            setTheme(initialTheme);
        }
        isMounted.current = true;
    }, [initialTheme, setTheme]);

    // Sync changes to DB
    useEffect(() => {
        if (!isMounted.current || !theme) return;

        // Use a debounce or just direct call if infrequent
        const timeout = setTimeout(() => {
            if (theme !== initialTheme) {
                updateUserPreferences('theme', theme);
            }
        }, 1000); // Debounce slightly to avoid rapid switching spam

        return () => clearTimeout(timeout);
    }, [theme, initialTheme]);

    return null; // Logic-only component
}
