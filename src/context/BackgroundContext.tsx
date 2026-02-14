'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { updateUserPreferences } from '@/app/actions';
import { useTheme } from 'next-themes';

export type BackgroundMode = 'empty' | 'forest';
export type FocusMode = 'default' | 'light' | 'tree';

interface BackgroundContextType {
    bgMode: BackgroundMode;
    focusMode: FocusMode;
    setFocusMode: (mode: FocusMode) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

interface BackgroundProviderProps {
    children: React.ReactNode;
    initialMode?: BackgroundMode | null;
}

export function BackgroundProvider({ children, initialMode }: BackgroundProviderProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [bgMode, setBgModeState] = useState<BackgroundMode>((initialMode as BackgroundMode) || 'empty');
    const [focusMode, setFocusModeState] = useState<FocusMode>('default');
    const isMounted = useRef(false);

    // Sync focusMode to theme and bgMode
    const changeFocusMode = (mode: FocusMode) => {
        setFocusModeState(mode);

        const updatePrefs = (bgMode: BackgroundMode) => {
            // Save to local storage for guests/persistence
            localStorage.setItem('focus_flow_bg_mode', bgMode);

            // Try to update DB if logged in (silently fail if not)
            updateUserPreferences('backgroundMode', bgMode).catch(() => { });
        };

        if (mode === 'light') {
            setTheme('light');
            setBgModeState('empty');
            updatePrefs('empty');
        } else if (mode === 'tree') {
            setTheme('forest'); // Use the new dedicated forest theme
            setBgModeState('forest');
            updatePrefs('forest');
        } else {
            // Default (Dark)
            setTheme('dark');
            setBgModeState('empty');
            setFocusModeState('default');
            updatePrefs('empty');
        }
    };

    // Initialize state based on initial props or local storage
    useEffect(() => {
        if (!isMounted.current) {
            const savedBg = (initialMode as BackgroundMode) || (localStorage.getItem('focus_flow_bg_mode') as BackgroundMode);

            if (savedBg === 'forest') {
                setFocusModeState('tree');
                setBgModeState('forest');
                setTheme('forest');
            } else {
                // Check resolved theme and sync focus mode on mount
                // resolvedTheme might be undefined on first render, so we rely on theme or system preference
            }
            isMounted.current = true;
        }
    }, [initialMode, setTheme]);

    // Sync FocusMode with Resolved Theme (Handles hydration and external changes)
    useEffect(() => {
        if (resolvedTheme === 'light' && focusMode !== 'light') {
            setFocusModeState('light');
        } else if (resolvedTheme === 'dark' && focusMode !== 'default' && bgMode !== 'forest') {
            // Only set to default (dark) if we are not in forest mode (which is also dark-ish but special)
            // Actually forest theme is 'forest', so resolvedTheme would be 'forest' (if supported) or 'dark' (if fallback).
            // Wait, we defined 'forest' as a custom theme in Providers.tsx themes={['light', 'dark', 'forest']}
            setFocusModeState('default');
        } else if (theme === 'forest' && focusMode !== 'tree') {
            setFocusModeState('tree');
        }
    }, [resolvedTheme, theme, focusMode, bgMode]);

    return (
        <BackgroundContext.Provider value={{ bgMode, focusMode, setFocusMode: changeFocusMode }}>
            {children}
        </BackgroundContext.Provider>
    );
}

export function useBackground() {
    const context = useContext(BackgroundContext);
    if (context === undefined) {
        throw new Error('useBackground must be used within a BackgroundProvider');
    }
    return context;
}
