'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { updateUserPreferences } from '@/app/actions';

type BackgroundMode = 'empty' | 'forest';

interface BackgroundContextType {
    bgMode: BackgroundMode;
    setBgMode: (mode: BackgroundMode) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

// Define props
interface BackgroundProviderProps {
    children: React.ReactNode;
    initialMode?: BackgroundMode | null;
}

export function BackgroundProvider({ children, initialMode }: BackgroundProviderProps) {
    // Initialize with DB value if present, else fallback to empty
    const [bgMode, setBgModeState] = useState<BackgroundMode>((initialMode as BackgroundMode) || 'empty');
    const isMounted = useRef(false);

    // Wrapper to update state AND server
    const setBgMode = (mode: BackgroundMode) => {
        setBgModeState(mode);
        // Sync to DB
        updateUserPreferences('backgroundMode', mode).catch(e => console.error("Failed to sync bg mode", e));
    };

    // Load preference from localStorage on mount IF no initialMode provided (fallback)
    useEffect(() => {
        if (!initialMode) {
            const savedMode = localStorage.getItem('focus_flow_bg_mode') as BackgroundMode;
            if (savedMode) {
                setBgModeState(savedMode);
            }
        }
        isMounted.current = true;
    }, [initialMode]);

    // Save preference when it changes (local + server)
    useEffect(() => {
        if (isMounted.current) {
            localStorage.setItem('focus_flow_bg_mode', bgMode);
        }
    }, [bgMode]);

    return (
        <BackgroundContext.Provider value={{ bgMode, setBgMode }}>
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
