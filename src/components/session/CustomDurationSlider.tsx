'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CustomDurationSliderProps {
    mode: string;
    isActive: boolean;
    customDuration: number;
    onDurationChange: (duration: number) => void;
}

export function CustomDurationSlider({ mode, isActive, customDuration, onDurationChange }: CustomDurationSliderProps) {
    return (
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
                        onChange={(e) => onDurationChange(parseInt(e.target.value) * 60)}
                        className="w-full h-2 bg-muted/50 rounded-full cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        <span>10m</span>
                        <span>3h</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
