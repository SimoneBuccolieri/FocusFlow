'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

const MODES: Record<string, number> = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    custom: 60 * 60, // Default
};

export const usePomodoro = (onComplete?: (durationSeconds?: number) => void) => {
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

        let duration = MODES[newMode];
        if (newMode === 'custom') {
            if (newDuration) {
                setCustomDuration(newDuration);
                duration = newDuration;
            } else {
                duration = customDuration;
            }
        }

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
            endTimeRef.current = now + timeLeft * 1000;
        }
    }, [isActive, timeLeft, requestNotificationPermission]);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(getTotalTime());
        endTimeRef.current = null;
    }, [getTotalTime]);

    const lastTickRef = useRef<number>(0);

    useEffect(() => {
        if (!isActive || !endTimeRef.current) return;

        lastTickRef.current = Date.now(); // Reset tick on start

        const interval = setInterval(() => {
            const now = Date.now();
            const delta = now - lastTickRef.current;

            // Anti-Cheat: Detect sleep or significant drift (> 5 seconds)
            if (delta > 5000) {
                // Sleep detected! Pause the timer.
                setIsActive(false);

                // Let's approximate: timeLeft is roughly (endTime - lastTickRef)/1000
                // We update timeLeft state to this value and clear endTime.
                const preservedTimeLeft = Math.ceil((endTimeRef.current! - lastTickRef.current) / 1000);

                setTimeLeft(preservedTimeLeft > 0 ? preservedTimeLeft : 0);
                endTimeRef.current = null;

                // console.log("Timer paused due to user inactivity/sleep");
                return;
            }

            lastTickRef.current = now;

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

                if (onComplete) {
                    onComplete(getTotalTime());
                }

            } else {
                setTimeLeft(remaining);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [isActive, mode, onComplete, getTotalTime]);

    const stopAndSave = useCallback(() => {
        const totalTime = getTotalTime();
        if (!isActive && timeLeft === totalTime) return 0; // Nothing to save

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

    return {
        timeLeft,
        isActive,
        mode,
        customDuration,
        switchMode,
        toggleTimer,
        resetTimer,
        stopAndSave
    };
};
