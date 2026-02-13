'use client';


import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Quote, Coffee } from 'lucide-react';
import { Checklist } from './Checklist';
import { ChecklistItem } from '@/types';
import { TimerMode } from '@/hooks/usePomodoro';

interface TaskEditorProps {
    mode: TimerMode;
    isActive: boolean;
    sessionTitle: string;
    setSessionTitle: (title: string) => void;
    sessionDescription: string;
    setSessionDescription: (desc: string) => void;
    checklist: ChecklistItem[];
    setChecklist: (items: ChecklistItem[]) => void;
}

export function TaskEditor({
    mode,
    isActive,
    sessionTitle,
    setSessionTitle,
    sessionDescription,
    setSessionDescription,
    checklist,
    setChecklist
}: TaskEditorProps) {
    return (
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
                            <label className="text-xs font-semibold text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">TASK TITLE</label>
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
    );
}
