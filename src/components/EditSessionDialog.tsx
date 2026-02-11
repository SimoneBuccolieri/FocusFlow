'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2 } from 'lucide-react'
import { updateSession } from '@/app/actions/sessions'

interface EditSessionDialogProps {
    session: {
        id: string
        title: string | null
        description: string | null
    }
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
}

export function EditSessionDialog({ session, isOpen, onClose, onUpdate }: EditSessionDialogProps) {
    const [title, setTitle] = useState(session.title || '')
    const [description, setDescription] = useState(session.description || '')
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await updateSession(session.id, { title, description })
            onUpdate()
            onClose()
        } catch (error) {
            console.error("Failed to update session:", error)
            alert("Errore durante l'aggiornamento.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 glass rounded-2xl z-50 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Modifica Sessione</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Titolo</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Cosa hai studiato?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted-foreground">Descrizione</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all min-h-[100px] resize-none"
                                    placeholder="Dettagli aggiuntivi..."
                                />
                            </div>

                            <div className="flex justify-end pt-4 gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
                                    disabled={isLoading}
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Salva
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
