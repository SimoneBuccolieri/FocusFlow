'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isLoading?: boolean;
}

export function ConfirmDeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Sei sicuro?",
    description = "Questa azione non può essere annullata.",
    isLoading = false
}: ConfirmDeleteDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 glass rounded-2xl z-[60] shadow-2xl border border-destructive/20"
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                                <AlertTriangle size={32} />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </div>

                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium border border-transparent hover:border-white/10"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                                    Elimina
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
