'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const MODES: Record<TimerMode, number> = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

export const usePomodoro = (onComplete?: (durationSeconds?: number) => void) => {
    const [mode, setMode] = useState<TimerMode>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(MODES.pomodoro);
    const [isActive, setIsActive] = useState(false);
    const endTimeRef = useRef<number | null>(null);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('pomodoro-mode') as TimerMode | null;
        const savedTimeLeft = localStorage.getItem('pomodoro-timeLeft');
        const savedIsActive = localStorage.getItem('pomodoro-isActive') === 'true';
        const savedEndTime = localStorage.getItem('pomodoro-endTime');

        if (savedMode && MODES[savedMode]) {
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
        if (endTimeRef.current) {
            localStorage.setItem('pomodoro-endTime', endTimeRef.current.toString());
        } else {
            localStorage.removeItem('pomodoro-endTime');
        }
    }, [mode, timeLeft, isActive]);

    const requestNotificationPermission = useCallback(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(MODES[newMode]);
        setIsActive(false);
        endTimeRef.current = null;
    }, []);

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
        setTimeLeft(MODES[mode]);
        endTimeRef.current = null;
    }, [mode]);

    const lastTickRef = useRef<number>(Date.now());

    useEffect(() => {
        if (!isActive || !endTimeRef.current) return;

        lastTickRef.current = Date.now(); // Reset tick on start

        const interval = setInterval(() => {
            const now = Date.now();
            const delta = now - lastTickRef.current;

            // Anti-Cheat: Detect sleep or significant drift (> 5 seconds)
            // Normal throttle in background is ~1s, so 5s is safe buffer for "sleep/hang"
            if (delta > 5000) {
                // Sleep detected! Pause the timer.
                setIsActive(false);

                // Calculate what the time left WAS before the sleep roughly
                // We add the delta back to endTime to "freeze" it effectively acting as if time stood still
                // Or simpler: calculate remaining based on the *intended* schedule shifted by delta?
                // Actually, if we pause, we just need to set timeLeft to what it was.
                // The most accurate we have is: (endTime - lastTick) - (time passed since lastTick aka tiny bit)
                // But wait, if we calculate remaining from CURRENT now, it's 0 or negative.
                // We want strictly to preserve the time.

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
                        body: `${mode === 'pomodoro' ? 'Focus session' : 'Break'} finished.`,
                    });
                }

                if (onComplete) {
                    onComplete(MODES[mode]);
                }

            } else {
                setTimeLeft(remaining);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [isActive, mode, onComplete]);

    // Visibility change handler can be simplified as we rely on the interval drift check for "Active" sleep
    // But for "Background Tab" (not sleep), we still want the timer to run correctly.
    // The interval continues in background (throttled). The `delta` check handles normal throttle (1s < 5s).
    // So if just background tab, `delta` is small, timer continues.
    // If PC sleep, `delta` is big, timer pauses. Perfect.

    // We can remove the visibilitychange specific logic that effectively acted as "Resume"
    // because standard setInterval handles background.
    // BUT if the browser severely throttles (e.g. 1 minute intervals), we might trigger anti-cheat?
    // Chrome throttles to 1Hz (1s). 5s buffer is fine.
    // Some browsers throttle more?
    // Let's keep 5s-10s.

    // Cleanup visibilitychange use entirely? 
    // The previous implementation used visibilitychange to "correct" the timer visual state immediately.
    // We can keep it for UI responsiveness but remove logic that might conflict.

    const stopAndSave = useCallback(() => {
        if (!isActive && timeLeft === MODES[mode]) return 0; // Nothing to save

        // Calculate elapsed time
        // If active: elapsed = total - timeLeft (approximately, might be off by 1s due to interval)
        // If paused: elapsed = total - timeLeft
        const totalTime = MODES[mode];
        const elapsed = totalTime - timeLeft;

        if (elapsed > 0) {
            setIsActive(false);
            setTimeLeft(MODES[mode]); // Reset
            endTimeRef.current = null;
            return elapsed;
        }
        return 0;
    }, [isActive, timeLeft, mode]); // Removed onComplete dependency

    return {
        timeLeft,
        isActive,
        mode,
        switchMode,
        toggleTimer,
        resetTimer,
        stopAndSave
    };
};
