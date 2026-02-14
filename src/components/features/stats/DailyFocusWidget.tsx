'use client';

import React from 'react';

interface DailyFocusWidgetProps {
    minutes: number;
}

export function DailyFocusWidget({ minutes }: DailyFocusWidgetProps) {
    // Determine color schema based on progress
    const getColorClass = () => {
        if (minutes === 0) return "text-muted-foreground"; // Removed /50 for better visibility
        if (minutes < 30) return "text-emerald-500"; // Darker/Stronger
        if (minutes < 60) return "text-emerald-400";
        if (minutes < 120) return "text-emerald-300";
        return "text-emerald-200 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]";
    };

    const getBgClass = () => {
        if (minutes === 0) return "bg-black/5 dark:bg-white/5 text-muted-foreground/50"; // Light mode fix
        if (minutes < 30) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-500";
        if (minutes < 60) return "bg-emerald-200 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400";
        if (minutes < 120) return "bg-emerald-300 dark:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300";
        return "bg-emerald-400 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.3)]";
    };

    return (
        <div className="flex items-center gap-4 group">
            <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider [.forest_&]:text-white/90 shadow-black/20 text-shadow-sm">Today&apos;s Focus</div>
                <div className={`text-4xl font-bold transition-colors duration-500 ${getColorClass()} [.forest_&]:text-white drop-shadow-md`}>
                    {minutes} <span className="text-lg font-normal opacity-60 [.forest_&]:opacity-80">min</span>
                </div>
            </div>

            <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500 ${getBgClass()}`}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={minutes > 0 ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-500 ${minutes >= 120 ? "animate-pulse" : ""}`}
                >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3a1 1 0 0 1 .4-.8c.7-.6 1.9-1.3 2.5-1.9a2.5 2.5 0 0 1 .5 1z" />
                </svg>
            </div>
        </div>
    );
}
