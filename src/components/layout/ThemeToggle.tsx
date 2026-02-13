'use client';

import { useBackground, FocusMode } from '@/context/BackgroundContext';
import { Moon, Sun, Trees } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
    const { focusMode, setFocusMode } = useBackground();

    const options: { id: FocusMode; label: string; icon: React.ElementType }[] = [
        { id: 'default', label: 'Dark', icon: Moon },
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'tree', label: 'Tree', icon: Trees },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex gap-1 p-1.5 glass rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            {options.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => setFocusMode(opt.id)}
                    className={cn(
                        "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                        focusMode === opt.id
                            ? "bg-primary text-primary-foreground shadow-lg scale-105"
                            : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                    )}
                    aria-label={`Switch to ${opt.label} mode`}
                >
                    <opt.icon size={16} />
                    <span className="hidden sm:inline">{opt.label}</span>
                </button>
            ))}
        </div>
    );
}
