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
    const { setTheme } = useTheme();
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
            updatePrefs('empty');
        }
    };

    // Initialize state based on initial props or local storage
    useEffect(() => {
        if (!isMounted.current) {
            const savedBg = (initialMode as BackgroundMode) || (localStorage.getItem('focus_flow_bg_mode') as BackgroundMode);

            if (savedBg === 'forest') {
                setFocusModeState('tree');
                setBgModeState('forest'); // Fix: Actually set the background mode
                setTheme('forest');
            } else {
                // If the user previously selected light mode, we might want to respect that too?
                // But for now, let's just ensure bgMode is correct.
                // If savedBg is 'empty', we check if theme is light? 
                // Next-themes handles the theme part, we just need to match focusMode status.
            }
            isMounted.current = true;
        }
    }, [initialMode, setTheme]);

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
