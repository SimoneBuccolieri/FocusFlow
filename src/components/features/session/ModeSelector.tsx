'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TimerMode } from '@/hooks/usePomodoro';
import { Brain, Coffee, BatteryCharging, Sliders } from 'lucide-react';

interface ModeSelectorProps {
    mode: TimerMode;
    isActive: boolean;
    onSwitchDetails: (mode: TimerMode) => void;
}

export function ModeSelector({ mode, isActive, onSwitchDetails }: ModeSelectorProps) {
    const modes = [
        { id: 'pomodoro', label: 'Focus', icon: Brain },
        { id: 'shortBreak', label: 'Short Break', icon: Coffee },
        { id: 'longBreak', label: 'Long Break', icon: BatteryCharging },
        { id: 'custom', label: 'Custom', icon: Sliders },
    ];

    return (
        <div className="flex p-1.5 rounded-full bg-muted/50 dark:bg-black/20 border border-border/50 dark:border-white/5 relative z-20 backdrop-blur-md mb-8">
            {modes.map((m) => (
                <button
                    key={m.id}
                    onClick={() => !isActive && onSwitchDetails(m.id as TimerMode)}
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
    );
}
