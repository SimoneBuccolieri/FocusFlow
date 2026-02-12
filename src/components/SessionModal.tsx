'use client';

import { useState } from 'react';
import { saveSession } from '@/app/actions';
import { X } from 'lucide-react';
import { ChecklistItem } from '@/types';
import { Checklist } from './Checklist';

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    completedDuration?: number; // in seconds
    initialTitle?: string;
    initialDescription?: string;
    initialChecklist?: ChecklistItem[];
    onChecklistChange?: (items: ChecklistItem[]) => void;
    onSaveSuccess?: () => void;
}

export function SessionModal({
    isOpen,
    onClose,
    completedDuration = 25 * 60,
    initialTitle = '',
    initialDescription = '',
    initialChecklist = [],
    onChecklistChange,
    onSaveSuccess
}: SessionModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [notes, setNotes] = useState('');
    const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
    const [durationMins, setDurationMins] = useState(Math.floor(completedDuration / 60));

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSaving(true);
        try {
            await saveSession({
                durationSeconds: durationMins * 60,
                title: title || "Study Session",
                description: description,
                privateNotes: notes,
                checklist: checklist.filter(i => i.text.trim().length > 0),
            });
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setNotes('');
            setChecklist([]);

            // Notify parent to reset? 
            // In SessionManager, we reset checklist state manually in handleManualSave, 
            // but here we are closing the modal. SessionManager might need to know to reset its state.
            // onChecklistChange?.([]); // Optional: reset parent state if provided
            if (onChecklistChange) onChecklistChange([]);
            if (onSaveSuccess) onSaveSuccess();
        } catch {
            alert("Failed to save session. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Sync local changes to parent if needed (for live updates in Mission Control if we were keeping it open, 
    // but here we are in a modal. If user changes checklist in modal, should it update parent? 
    // Yes, probably good practice, but not strictly required if we save from here.

    const handleChecklistUpdate = (newItems: ChecklistItem[]) => {
        setChecklist(newItems);
        if (onChecklistChange) onChecklistChange(newItems);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass p-1 rounded-3xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="bg-black/40 backdrop-blur-xl rounded-[1.25rem] border border-white/5 overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-all duration-200 z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Log Session</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ... Duration ... */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={durationMins}
                                    onChange={(e) => setDurationMins(parseInt(e.target.value) || 0)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Title</label>
                                <input
                                    type="text"
                                    placeholder="What did you work on?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Description (Public)</label>
                                <textarea
                                    placeholder="Details regarding your session..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none min-h-[80px] transition-all placeholder:text-muted-foreground/50 resize-none disabled:opacity-50"

                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Checklist</label>
                                <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 min-h-[100px]">
                                    <Checklist
                                        items={checklist}
                                        onChange={handleChecklistUpdate}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Private Notes</label>
                                <textarea
                                    placeholder="Thoughts, ideas, or things to remember..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none min-h-[80px] transition-all placeholder:text-muted-foreground/50 resize-none disabled:opacity-50"

                                />
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:translate-y-[-1px] active:translate-y-[0px]"
                                >
                                    {isSaving ? 'Saving...' : 'Save Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
