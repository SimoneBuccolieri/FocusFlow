'use client';

import { useCallback, useState } from 'react';
import { saveSession } from '@/app/actions';
import { Timer } from './Timer';
import { usePomodoro, TimerMode } from '@/hooks/usePomodoro';
import { SessionModal } from './SessionModal';
import { Checklist } from './Checklist';
import { ChecklistItem } from '@/types';
import { Pencil, Play, Target, Sparkles, Coffee, Brain, BatteryCharging, Quote, Sliders, Ban, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SessionManager() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('');
    const [sessionDescription, setSessionDescription] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [bgMode, setBgMode] = useState<'empty' | 'forest'>('empty');

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
        <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto px-4">

            {/* Top: Mode Switcher */}
            <div className="flex p-1.5 rounded-full bg-muted/50 dark:bg-black/20 border border-border/50 dark:border-white/5 relative z-20 backdrop-blur-md mb-8">
                {[
                    { id: 'pomodoro', label: 'Focus', icon: Brain },
                    { id: 'shortBreak', label: 'Short Break', icon: Coffee },
                    { id: 'longBreak', label: 'Long Break', icon: BatteryCharging },
                    { id: 'custom', label: 'Custom', icon: Sliders },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => !isActive && switchMode(m.id as TimerMode)}
                        disabled={isActive}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative z-10 flex items-center gap-2",
                            mode === m.id
                                ? "text-white"
                                : "text-muted-foreground hover:text-foreground",
                            isActive && mode !== m.id && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <m.icon size={16} />
                        <span className="hidden sm:inline">{m.label}</span>
                        {mode === m.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm rounded-full -z-10 shadow-lg shadow-emerald-500/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Custom Duration Slider */}
            <AnimatePresence>
                {mode === 'custom' && !isActive && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="w-full max-w-sm glass p-4 rounded-2xl border border-white/5 flex flex-col gap-3 mb-8"
                    >
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="text-primary">{Math.floor(customDuration / 60)} min</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="180"
                            step="5"
                            value={Math.floor(customDuration / 60)}
                            onChange={(e) => switchMode('custom', parseInt(e.target.value) * 60)}
                            className="w-full h-2 bg-muted/50 rounded-full cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            <span>10m</span>
                            <span>3h</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area: Side-by-Side on Desktop */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">

                {/* Left: Timer */}
                <div className="w-full flex justify-center lg:justify-end">
                    <Timer {...pomodoroState} stopAndSave={handleManualSave} />
                </div>

                {/* Right: Mission Control / Session Details */}
                <div className="w-full flex justify-center lg:justify-start h-full">
                    <AnimatePresence mode="wait">
                        {mode === 'pomodoro' || mode === 'custom' ? (
                            <motion.div
                                key="editor"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-md glass p-8 rounded-[2.5rem] flex flex-col gap-6 border border-white/10 shadow-2xl relative overflow-hidden min-h-[400px]"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                    <Target size={120} />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-1">
                                        <Sparkles size={14} />
                                        Current Mission
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground/90">What&apos;s the goal?</h2>
                                </div>

                                <div className="space-y-6 flex-1 flex flex-col z-10">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">TASK TITILE</label>
                                        <input
                                            type="text"
                                            placeholder="Designing the new homepage..."
                                            value={sessionTitle}
                                            onChange={(e) => setSessionTitle(e.target.value)}
                                            className="w-full bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/5 rounded-2xl px-5 py-4 text-lg font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background/50 dark:focus:bg-white/10 transition-all shadow-inner"
                                            autoFocus={!isActive}
                                        />
                                    </div>

                                    <div className="space-y-2 group flex-1 flex flex-col">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">NOTES & THOUGHTS</label>
                                        <textarea
                                            placeholder="Break it down into steps..."
                                            value={sessionDescription}
                                            onChange={(e) => setSessionDescription(e.target.value)}
                                            className="w-full flex-1 bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/5 rounded-2xl px-5 py-4 text-sm leading-relaxed placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background/50 dark:focus:bg-white/10 transition-all resize-none shadow-inner min-h-[80px]"
                                        />
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">CHECKLIST</label>
                                        <div className="bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/5 rounded-2xl px-5 py-4 min-h-[100px] shadow-inner">
                                            <Checklist
                                                items={checklist}
                                                onChange={setChecklist}
                                                readonly={false}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isActive && (
                                    <div className="absolute bottom-3 right-6 flex items-center gap-2 text-xs text-primary/60 animate-pulse">
                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                        Sessione in corso...
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="break"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full max-w-md glass p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 border border-white/10 shadow-2xl min-h-[400px]"
                            >
                                <div className="p-6 bg-emerald-500/10 rounded-full text-emerald-400 mb-2">
                                    <Coffee size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Time to recharge</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto">
                                        Grab a coffee, stretch, or just close your eyes for a moment.
                                    </p>
                                </div>
                                <div className="p-6 bg-white/5 rounded-2xl max-w-xs w-full">
                                    <div className="mb-2 text-primary opacity-50"><Quote size={20} /></div>
                                    <p className="text-sm italic text-white/70">&quot;Rest is not idleness, and to lie sometimes on the grass on a summer day listening to the murmur of water, or watching the clouds float across the blue sky, is by no means a waste of time.&quot;</p>
                                    <p className="text-xs text-muted-foreground mt-4 text-right">— John Lubbock</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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

            {/* Background Selector */}
            <div className="fixed bottom-6 right-6 z-50 flex gap-2 p-1.5 glass rounded-full">
                {[
                    { id: 'empty', label: 'Empty', icon: Ban },
                    { id: 'forest', label: 'Forest', icon: Trees },
                ].map((bg) => (
                    <button
                        key={bg.id}
                        onClick={() => setBgMode(bg.id as 'empty' | 'forest')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                            bgMode === bg.id
                                ? "bg-primary text-primary-foreground shadow-lg"
                                : "hover:bg-white/10 text-muted-foreground hover:text-white"
                        )}
                    >
                        <bg.icon size={16} />
                        <span className="hidden sm:inline">{bg.label}</span>
                    </button>
                ))}
            </div>

            {/* Dynamic Background Layer */}
            <AnimatePresence>
                {bgMode === 'forest' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 z-[-1] bg-[url('https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat"
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
