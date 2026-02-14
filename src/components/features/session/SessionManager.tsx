'use client';

import { useCallback, useState, useEffect } from 'react';
import { saveSession } from '@/app/actions';
import { useTimer } from '@/context/TimerContext';
import { Timer } from "@/components/features/timer/Timer";
import { ModeSelector } from "./ModeSelector";
import { TaskEditor } from "./TaskEditor";
import { ChecklistItem } from '@/types';
import { CustomDurationSlider } from './CustomDurationSlider';

export function SessionManager() {
    const [sessionTitle, setSessionTitle] = useState('');
    const [sessionDescription, setSessionDescription] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

    const pomodoroState = useTimer();
    const { mode, switchMode, isActive, customDuration, timeLeft, resetTimer } = pomodoroState;

    const handleAutoSave = useCallback(async () => {
        // Calculate duration based on mode
        let duration = 0;
        switch (mode) {
            case 'pomodoro': duration = 25 * 60; break;
            case 'shortBreak': duration = 5 * 60; break;
            case 'longBreak': duration = 15 * 60; break;
            case 'custom': duration = customDuration; break;
        }

        try {
            await saveSession({
                durationSeconds: duration,
                title: sessionTitle || "Focus Session",
                description: sessionDescription,
                privateNotes: "",
                checklist: checklist.filter(i => i.text.trim().length > 0),
            });

            // Reset form
            setSessionTitle('');
            setSessionDescription('');
            setChecklist([]);

            // Notification toast could be added here
            console.log("Session auto-saved successfully");
        } catch (error) {
            console.error("Failed to auto-save session:", error);
        }
    }, [mode, customDuration, sessionTitle, sessionDescription, checklist]);

    // Handle Timer Completion
    useEffect(() => {
        if (!isActive && timeLeft === 0) {
            // Play notification sound
            const audio = new Audio('/sounds/bell.mp3');
            audio.play().catch(e => console.log("Audio play failed", e));

            // Auto-save and reset
            handleAutoSave();
            resetTimer();
        }
    }, [isActive, timeLeft, handleAutoSave, resetTimer]);

    const handleManualSave = async () => {
        const elapsed = pomodoroState.stopAndSave();
        if (elapsed > 0) {
            try {
                await saveSession({
                    durationSeconds: elapsed,
                    title: sessionTitle || "Focus Session",
                    description: sessionDescription,
                    privateNotes: "",
                    checklist: checklist.filter(i => i.text.trim().length > 0),
                });

                // Reset form
                setSessionTitle('');
                setSessionDescription('');
                setChecklist([]);
            } catch (error) {
                console.error("Failed to save session:", error);
                alert("Failed to save session. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto px-4 relative z-10">

            {/* Top: Mode Switcher */}
            <ModeSelector
                mode={mode}
                isActive={isActive}
                onSwitchDetails={(m) => switchMode(m)}
            />

            {/* Custom Duration Slider */}
            <CustomDurationSlider
                mode={mode}
                isActive={isActive}
                customDuration={customDuration}
                onDurationChange={(d) => switchMode('custom', d)}
            />

            {/* Main Content Area: Side-by-Side on Desktop */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">

                {/* Left: Timer */}
                <div className="w-full flex justify-center lg:justify-end">
                    <Timer {...pomodoroState} stopAndSave={handleManualSave} />
                </div>

                {/* Right: Mission Control / Session Details */}
                <div className="w-full flex justify-center lg:justify-start h-full">
                    <TaskEditor
                        mode={mode}
                        isActive={isActive}
                        sessionTitle={sessionTitle}
                        setSessionTitle={setSessionTitle}
                        sessionDescription={sessionDescription}
                        setSessionDescription={setSessionDescription}
                        checklist={checklist}
                        setChecklist={setChecklist}
                    />
                </div>

            </div>

            <p className="text-sm text-muted-foreground text-center max-w-xs [.forest_&]:text-white/80">
                *Tip: Complete a session to see your heatmap grow.
            </p>
        </div>
    );
}
