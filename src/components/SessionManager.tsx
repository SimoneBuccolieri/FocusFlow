'use client';

import { useCallback, useState } from 'react';
import { saveSession } from '@/app/actions';
import { Timer } from './Timer';
import { usePomodoro, TimerMode } from '@/hooks/usePomodoro';
import { SessionModal } from './SessionModal';
import { ChecklistItem } from '@/types';
import { ModeSelector } from './session/ModeSelector';
import { TaskEditor } from './session/TaskEditor';
import { CustomDurationSlider } from './session/CustomDurationSlider';
import { cn } from '@/lib/utils';

export function SessionManager() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('');
    const [sessionDescription, setSessionDescription] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

    const handleTimerComplete = useCallback((durationSeconds?: number) => {
        // Play notification sound?
        const audio = new Audio('/sounds/bell.mp3');
        audio.play().catch(e => console.log("Audio play failed", e));

        // Open modal
        setIsModalOpen(true);
    }, []);

    const pomodoroState = usePomodoro(handleTimerComplete);
    const { mode, switchMode, isActive, customDuration } = pomodoroState;

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

    // Update completed duration based on mode
    const getDuration = () => {
        switch (pomodoroState.mode) {
            case 'pomodoro': return 25 * 60;
            case 'shortBreak': return 5 * 60;
            case 'longBreak': return 15 * 60;
            case 'custom': return pomodoroState.customDuration;
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

            <p className="text-sm text-muted-foreground text-center max-w-xs">
                *Tip: Complete a session to see your heatmap grow.
            </p>

            <SessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                completedDuration={getDuration()}
                initialTitle={sessionTitle}
                initialDescription={sessionDescription}
                initialChecklist={checklist}
                onChecklistChange={setChecklist}
            />
        </div>
    );
}
