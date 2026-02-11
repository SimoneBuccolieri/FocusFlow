'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Clock, Pencil, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { SessionModal } from './SessionModal';
import { useRouter } from 'next/navigation';
import { EditSessionDialog } from './EditSessionDialog';
import { deleteSession } from '@/app/actions';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { Session } from '@/types';

interface WeeklyProgressProps {
    data: Session[];
    readonly?: boolean;
}
export function WeeklyProgress({ data, readonly = false }: WeeklyProgressProps) {
    const router = useRouter();
    // Use stable today reference (normalized to midnight)
    const today = useMemo(() => startOfDay(new Date()), []);
    const [selectedDateStr, setSelectedDateStr] = useState(() => format(today, 'yyyy-MM-dd'));
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!sessionToDelete) return;

        setDeletingId(sessionToDelete);
        try {
            await deleteSession(sessionToDelete);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete session:", error);
            alert("Errore durante l'eliminazione.");
        } finally {
            setDeletingId(null);
            setSessionToDelete(null);
        }
    };

    const handleDelete = (e: React.MouseEvent, sessionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSessionToDelete(sessionId);
    };

    // Generate last 7 days as stable objects
    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = subDays(today, i);
            return {
                date,
                dateStr: format(date, 'yyyy-MM-dd'),
                dayName: new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(date),
                dayNum: date.getDate()
            };
        }).reverse();
    }, [today]);

    // Derived state for selected date object (for display)
    const selectedDate = useMemo(() => parseISO(selectedDateStr), [selectedDateStr]);

    // Filter sessions for selected date
    const selectedSessions = useMemo(() => {
        return data.filter(s => isSameDay(new Date(s.startTime), selectedDate));
    }, [data, selectedDate]);

    // Group sessions by date for the bar indicators
    const sessionsByDate = useMemo(() => {
        return data.reduce((acc, session) => {
            const dateKey = format(new Date(session.startTime), 'yyyy-MM-dd');
            acc[dateKey] = (acc[dateKey] || 0) + session.duration;
            return acc;
        }, {} as Record<string, number>);
    }, [data]);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

            {/* Days Bar - Premium Segmented Control */}
            <div className="bg-muted/50 dark:bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-border/50 dark:border-white/5 relative flex justify-between items-center w-full">
                {days.map((day) => {
                    const isSelected = day.dateStr === selectedDateStr;
                    const isToday = day.dateStr === format(today, 'yyyy-MM-dd');
                    const hasActivity = (sessionsByDate[day.dateStr] || 0) > 0;

                    return (
                        <button
                            key={day.dateStr}
                            onClick={() => setSelectedDateStr(day.dateStr)}
                            className={cn(
                                "relative flex-1 flex flex-col items-center justify-center py-3 rounded-full transition-colors duration-300 z-10 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                                isSelected ? "text-white" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="activeDay"
                                    className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <span className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5 transition-opacity", isSelected ? "opacity-100" : "opacity-50")}>
                                {day.dayName}
                            </span>
                            <span className={cn("text-lg font-bold leading-none transition-transform", isSelected ? "scale-110" : "scale-100")}>
                                {day.dayNum}
                            </span>

                            {/* Subtler Activity Dot */}
                            {hasActivity && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500/50" />
                            )}

                            {isToday && !isSelected && (
                                <div className="absolute top-2 right-1/2 translate-x-3 w-1 h-1 rounded-full bg-blue-400" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Day Content */}
            <div className="min-h-[200px] glass rounded-[2rem] p-8 border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <Calendar className="text-primary" size={24} />
                        {isSameDay(selectedDate, new Date()) ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="text-sm text-muted-foreground font-medium bg-white/5 px-4 py-1.5 rounded-full">
                        {selectedSessions.length} sessions
                    </div>
                </div>

                {selectedSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/50 border-2 border-dashed border-white/5 rounded-2xl">
                        <p>No activity recorded for this day.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {selectedSessions.map((session, index) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/20 transition-all group flex items-start justify-between gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 p-2 rounded-full bg-emerald-500/10 text-emerald-500">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg text-white/90">
                                                {session.title || "Untitled Session"}
                                            </h4>
                                            {session.description && (
                                                <p className="text-muted-foreground text-sm mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                                                    {session.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-3 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                                                <Clock size={12} />
                                                {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                                {Math.round(session.duration / 60)} min
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {!readonly && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingSession(session)}
                                                className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, session.id)}
                                                disabled={deletingId === session.id}
                                                className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={18} className={cn(deletingId === session.id && "animate-spin")} />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Edit Dialog */}
                {editingSession && (
                    <EditSessionDialog
                        session={editingSession}
                        isOpen={!!editingSession}
                        onClose={() => setEditingSession(null)}
                        onUpdate={() => {
                            router.refresh();
                            setEditingSession(null);
                        }}
                    />
                )}

                <ConfirmDeleteDialog
                    isOpen={!!sessionToDelete}
                    onClose={() => setSessionToDelete(null)}
                    onConfirm={confirmDelete}
                    isLoading={!!deletingId}
                    title="Elimina sessione"
                    description="Sei sicuro di voler eliminare questa sessione? L'azione è irreversibile."
                />
            </div>
        </div>
    );
}
