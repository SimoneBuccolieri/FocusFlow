'use client';

import { Play, Pause, RotateCcw, Coffee, Brain, BatteryCharging, Save, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePomodoro } from '@/hooks/usePomodoro';

type TimerProps = Omit<ReturnType<typeof usePomodoro>, 'stopAndSave'> & {
    stopAndSave: () => void | Promise<void>;
};

export function Timer({ timeLeft, isActive, mode, toggleTimer, resetTimer, stopAndSave, customDuration }: TimerProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalTime = mode === 'pomodoro' ? 25 * 60
        : mode === 'shortBreak' ? 5 * 60
            : mode === 'longBreak' ? 15 * 60
                : customDuration; // Handle custom

    const progress = totalTime ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

    // Circle configuration
    const size = 320;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getModeIcon = () => {
        switch (mode) {
            case 'pomodoro': return <Brain size={20} className="mr-2" />;
            case 'shortBreak': return <Coffee size={20} className="mr-2" />;
            case 'longBreak': return <BatteryCharging size={20} className="mr-2" />;
            case 'custom': return <Sliders size={20} className="mr-2" />;
        }
    };

    const getModeLabel = () => {
        switch (mode) {
            case 'pomodoro': return 'Deep Focus';
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
            case 'custom': return 'Custom Focus';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto relative z-10">
            {/* Ambient Glow */}
            <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[120px] rounded-full transition-all duration-1000",
                isActive ? "opacity-100 scale-125 bg-primary/30" : "opacity-30 scale-90"
            )} />

            <div className="glass p-8 md:p-12 rounded-[2.5rem] w-full flex flex-col items-center relative overflow-hidden backdrop-blur-2xl shadow-2xl border border-white/10">



                {/* Main Timer Display */}
                <div className="relative mb-12">
                    {/* Progress Circle */}
                    <svg width={size} height={size} className="transform -rotate-90">
                        {/* Background Track */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-gray-200 dark:text-white/5 transition-colors duration-300"
                        />
                        {/* Progress Indicator */}
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={cn(
                                "text-primary transition-all duration-1000 ease-linear",
                                isActive && "drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                            )}
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={cn(
                            "flex items-center text-primary font-medium tracking-wider uppercase text-sm mb-2 transition-all duration-500",
                            isActive ? "opacity-100 translate-y-0" : "opacity-80 translate-y-1"
                        )}>
                            {getModeIcon()}
                            {getModeLabel()}
                        </div>
                        <div className={cn(
                            "text-7xl md:text-8xl font-bold tracking-tighter tabular-nums text-foreground transition-all duration-300",
                            isActive && "text-glow scale-105"
                        )}>
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2 font-medium opacity-60">
                            {isActive ? "Stay focused" : "Ready to start?"}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8">
                    <button
                        onClick={resetTimer}
                        className="p-4 rounded-full text-muted-foreground hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
                        aria-label="Reset Timer"
                        title="Reset Timer"
                    >
                        <RotateCcw size={24} />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={cn(
                            "h-24 w-24 rounded-[2rem] flex items-center justify-center transition-all duration-300 active:scale-95 shadow-xl group relative overflow-hidden",
                            isActive
                                ? "bg-muted dark:bg-white/10 text-foreground dark:text-white hover:bg-muted/80 dark:hover:bg-white/20 border border-border/50 dark:border-white/10"
                                : "bg-primary text-white hover:bg-primary/90 shadow-primary/30"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                            isActive ? "hidden" : "block"
                        )} />
                        {isActive ? (
                            <Pause size={36} fill="currentColor" className="opacity-90" />
                        ) : (
                            <Play size={36} fill="currentColor" className="ml-2" />
                        )}
                    </button>

                    <button
                        onClick={stopAndSave}
                        className="p-4 rounded-full text-muted-foreground hover:bg-muted dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
                        aria-label="Save Session"
                        title="Save Session Early"
                    >
                        <Save size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
