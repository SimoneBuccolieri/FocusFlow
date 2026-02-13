'use client';

import { useBackground } from '@/context/BackgroundContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, Trees } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalBackground() {
    const { bgMode, setBgMode } = useBackground();

    return (
        <>
            {/* Background Image Layer */}
            <AnimatePresence>
                {bgMode === 'forest' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="fixed inset-0 z-0 pointer-events-none"
                    >
                        <img
                            src="/backgrounds/forest.jpg"
                            alt="Forest Background"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Floating Selector UI */}
            <div className="fixed bottom-6 right-6 z-50 flex gap-2 p-1.5 glass rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                {[
                    { id: 'empty', label: 'Default', icon: Ban },
                    { id: 'forest', label: 'Forest', icon: Trees },
                ].map((bg) => (
                    <button
                        key={bg.id}
                        onClick={() => setBgMode(bg.id as 'empty' | 'forest')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                            bgMode === bg.id
                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <bg.icon size={16} />
                        <span className="hidden sm:inline">{bg.label}</span>
                    </button>
                ))}
            </div>
        </>
    );
}
