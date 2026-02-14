'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

interface TimerContextType {
    mode: TimerMode;
    timeLeft: number;
    isActive: boolean;
    customDuration: number;
    switchMode: (newMode: TimerMode, newDuration?: number) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    stopAndSave: (() => number);
    // Expose helpers if needed
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const MODES: Record<string, number> = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    custom: 60 * 60, // Default
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
};

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<TimerMode>('pomodoro');
    const [customDuration, setCustomDuration] = useState(MODES.custom);
    const [timeLeft, setTimeLeft] = useState(MODES.pomodoro);
    const [isActive, setIsActive] = useState(false);
    const endTimeRef = useRef<number | null>(null);

    // Helper to get total time for current mode
    const getTotalTime = useCallback(() => {
        return mode === 'custom' ? customDuration : MODES[mode];
    }, [mode, customDuration]);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('pomodoro-mode') as TimerMode | null;
        const savedTimeLeft = localStorage.getItem('pomodoro-timeLeft');
        const savedIsActive = localStorage.getItem('pomodoro-isActive') === 'true';
        const savedEndTime = localStorage.getItem('pomodoro-endTime');
        const savedCustomDuration = localStorage.getItem('pomodoro-customDuration');

        if (savedCustomDuration) {
            setCustomDuration(parseInt(savedCustomDuration));
        }

        if (savedMode && (MODES[savedMode] || savedMode === 'custom')) {
            setMode(savedMode);
        }

        if (savedIsActive && savedEndTime) {
            const now = Date.now();
            const remaining = Math.ceil((parseInt(savedEndTime) - now) / 1000);

            if (remaining > 0) {
                setTimeLeft(remaining);
                setIsActive(true);
                endTimeRef.current = parseInt(savedEndTime);
            } else {
                // Timer finished while closed
                setTimeLeft(0);
                setIsActive(false);
                endTimeRef.current = null;
            }
        } else if (savedTimeLeft) {
            setTimeLeft(parseInt(savedTimeLeft));
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('pomodoro-mode', mode);
        localStorage.setItem('pomodoro-timeLeft', timeLeft.toString());
        localStorage.setItem('pomodoro-isActive', isActive.toString());
        localStorage.setItem('pomodoro-customDuration', customDuration.toString());
        if (endTimeRef.current) {
            localStorage.setItem('pomodoro-endTime', endTimeRef.current.toString());
        } else {
            localStorage.removeItem('pomodoro-endTime');
        }
    }, [mode, timeLeft, isActive, customDuration]);

    const requestNotificationPermission = useCallback(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const switchMode = useCallback((newMode: TimerMode, newDuration?: number) => {
        setMode(newMode);

        let duration: number;
        if (newMode === 'custom') {
            if (newDuration) {
                setCustomDuration(newDuration);
                duration = newDuration;
            } else {
                duration = customDuration;
            }
        } else {
            duration = MODES[newMode];
        }

        // When switching modes, always stop logic first
        setTimeLeft(duration);
        setIsActive(false);
        endTimeRef.current = null;
    }, [customDuration]);

    const toggleTimer = useCallback(() => {
        if (isActive) {
            // Pause
            setIsActive(false);
            endTimeRef.current = null;
        } else {
            // Start/Resume
            requestNotificationPermission();
            setIsActive(true);
            const now = Date.now();
            // Calculate end time based on current timeLeft
            endTimeRef.current = now + timeLeft * 1000;
        }
    }, [isActive, timeLeft, requestNotificationPermission]);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(getTotalTime());
        endTimeRef.current = null;
    }, [getTotalTime]);

    // Timer Interval logic
    useEffect(() => {
        if (!isActive || !endTimeRef.current) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.ceil((endTimeRef.current! - now) / 1000);

            if (remaining <= 0) {
                setTimeLeft(0);
                setIsActive(false);
                endTimeRef.current = null;

                // Notify user
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification("Time's up!", {
                        body: `${mode === 'pomodoro' ? 'Focus session' : 'Timer'} finished.`,
                    });
                }
            } else {
                setTimeLeft(remaining);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [isActive, mode]);

    const stopAndSave = useCallback(() => {
        const totalTime = getTotalTime();
        // If timer is running or paused but not started, handle appropriately
        // Actually if not active and timeLeft == totalTime, means we just reset or haven't started.

        if (!isActive && timeLeft === totalTime) return 0;

        // Calculate elapsed time
        const elapsed = totalTime - timeLeft;

        if (elapsed > 0) {
            setIsActive(false);
            setTimeLeft(totalTime); // Reset
            endTimeRef.current = null;
            return elapsed;
        }
        return 0;
    }, [isActive, timeLeft, getTotalTime]);

    const contextValue: TimerContextType = {
        mode,
        timeLeft,
        isActive,
        customDuration,
        switchMode,
        toggleTimer,
        resetTimer,
        stopAndSave
    };

    return (
        <TimerContext.Provider value={contextValue}>
            {children}
        </TimerContext.Provider>
    );
}
