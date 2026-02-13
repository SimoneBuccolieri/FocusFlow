'use client';

import { useBackground } from '@/context/BackgroundContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { ThemeToggle } from './ThemeToggle';

export function GlobalBackground() {
    const { bgMode } = useBackground();

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
                        <Image
                            src="/backgrounds/forest.jpg"
                            alt="Forest Background"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/20" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Floating Selector UI */}
            <ThemeToggle />
        </>
    );
}
