'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { format, eachDayOfInterval, startOfYear, endOfYear, startOfWeek, endOfWeek, isSameYear, getMonth, getDate } from 'date-fns';
import { it } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlignLeft, Pencil, Trash2, Loader2 } from 'lucide-react';
import { deleteSession } from '@/app/actions/sessions';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { EditSessionDialog } from '@/components/EditSessionDialog';
import { useRouter } from 'next/navigation';
import { ActivityData, Session } from '@/types';



interface HeatmapProps {
    data: ActivityData[];
    year?: number;
    isEditable?: boolean;
}

export function Heatmap({ data, year = new Date().getFullYear(), isEditable = false }: HeatmapProps) {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
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

    // ... (rest of the component logic)

    // In the JSX where actions are rendered:

    // Generate full year grid
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));

    // Start on Monday (weekStartsOn: 1)
    const calendarStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(endDate, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Group by weeks
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    days.forEach((day, index) => {
        if (index > 0 && index % 7 === 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-muted/50 dark:bg-white/5 border border-black/10 dark:border-transparent hover:bg-muted dark:hover:bg-white/10';
        if (count < 30) return 'bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/20'; // Very subtle
        if (count < 60) return 'bg-emerald-900/60 hover:bg-emerald-900/80 border border-emerald-800/30';
        if (count < 120) return 'bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-500/30';
        return 'bg-emerald-400 shadow-[0_0_10px_theme(colors.emerald.400)] hover:bg-emerald-300 border border-emerald-300/50';
    };

    const getTooltip = (count: number, date: Date) => {
        const dateStr = format(date, "EEEE d MMMM", { locale: it });
        // Capitalize first letter
        const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        if (count === 0) return `Nessuna attività il ${formattedDate}`;

        const hours = Math.floor(count / 60);
        const mins = count % 60;
        let timeStr = "";
        if (hours > 0) timeStr += `${hours}h `;
        if (mins > 0 || hours === 0) timeStr += `${mins}m`;

        return `${timeStr} di studio il ${formattedDate}`;
    };

    const selectedDayData = selectedDate ? data.find(d => d.date === selectedDate) : null;

    // Month labels
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

    const handleDelete = (e: React.MouseEvent, sessionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSessionToDelete(sessionId);
    };

    return (
        <div className="w-full space-y-6">
            <div className="w-full glass p-6 md:p-8 rounded-[2rem] overflow-hidden backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-foreground/80 flex items-center gap-2">
                        Registro Attività
                        <span className="text-muted-foreground text-sm font-normal">({year})</span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground hidden sm:flex">
                        <span>Meno</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-muted/50 dark:bg-white/5 border border-black/10 dark:border-transparent" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-950/40 border border-emerald-900/20" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-900/60 border border-emerald-800/30" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-600/80 border border-emerald-500/30" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-400 shadow-[0_0_4px_theme(colors.emerald.400)]" />
                        </div>
                        <span>Più</span>
                    </div>
                </div>

                <div className="flex">
                    {/* Day Labels (Left) */}
                    <div className="flex flex-col gap-1 pt-6 mr-2 text-[10px] text-muted-foreground/60 font-medium">
                        <div className="h-3.5 flex items-center">Lun</div>
                        <div className="h-3.5 flex items-center"></div>
                        <div className="h-3.5 flex items-center">Mer</div>
                        <div className="h-3.5 flex items-center"></div>
                        <div className="h-3.5 flex items-center">Ven</div>
                        <div className="h-3.5 flex items-center"></div>
                        <div className="h-3.5 flex items-center">Dom</div>
                    </div>

                    <div className="overflow-x-auto pb-2 scrollbar-hide flex-1">
                        {/* Month Labels (Top) */}
                        <div className="flex gap-1 text-[10px] text-muted-foreground mb-1 font-medium min-w-max h-5">
                            {weeks.map((week, index) => {
                                const firstDay = week[0];
                                const dayOfFirst = week.find(d => getDate(d) === 1);
                                const currentMonth = dayOfFirst ? getMonth(dayOfFirst) : getMonth(firstDay);

                                // Show label if it's the first of the month
                                // OR if it's the very first week and we want to show Jan (even if Jan 1st isn't monday)
                                // actually standard github heatmap logic: label appears on the week containing the 1st.
                                const showLabel = !!dayOfFirst || (index === 0 && currentMonth === 0);

                                return (
                                    <div key={index} className="w-3.5 flex flex-col items-center relative h-full">
                                        {showLabel && (
                                            <span className="absolute bottom-0 left-0 whitespace-nowrap z-10">{months[currentMonth]}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-1 min-w-max">
                            {weeks.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col gap-1">
                                    {week.map((day) => {
                                        const isCurrentYear = isSameYear(day, startDate);
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const activity = data.find(d => d.date === dateStr);
                                        const count = activity ? activity.count : 0;
                                        const opacity = isCurrentYear ? 'opacity-100' : 'opacity-0 pointer-events-none';
                                        const isSelected = selectedDate === dateStr;

                                        return (
                                            <div
                                                key={dateStr}
                                                onClick={() => isCurrentYear && setSelectedDate(isSelected ? null : dateStr)}
                                                className={clsx(
                                                    "w-3.5 h-3.5 rounded-sm transition-all duration-200 cursor-pointer",
                                                    getColor(count),
                                                    opacity,
                                                    isSelected && "ring-2 ring-white ring-offset-2 ring-offset-black z-10 scale-110"
                                                )}
                                                title={getTooltip(count, day)}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Day Details */}
            <AnimatePresence mode="wait">
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass p-6 rounded-3xl"
                    >
                        <h4 className="text-lg font-medium mb-4 flex items-center gap-2">
                            Attività del {format(new Date(selectedDate), "d MMMM yyyy", { locale: it })}
                        </h4>

                        {!selectedDayData || !selectedDayData.sessions || selectedDayData.sessions.length === 0 ? (
                            <p className="text-muted-foreground italic">Nessuna sessione registrata.</p>
                        ) : (
                            <div className="space-y-3">
                                {selectedDayData.sessions.map((session) => (
                                    <div key={session.id} className="bg-white/5 p-4 rounded-xl flex items-center gap-4 border border-white/5 group hover:border-white/10 transition-colors">
                                        <div className="bg-primary/20 p-2 rounded-full text-primary shrink-0">
                                            <Clock size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h5 className="font-semibold text-foreground truncate">{session.title || "Sessione senza titolo"}</h5>
                                                <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-muted-foreground shrink-0">
                                                    {Math.round(session.duration / 60)} min
                                                </span>
                                            </div>
                                            {session.description && (
                                                <p className="text-sm text-muted-foreground mt-1 flex items-start gap-2 truncate">
                                                    <AlignLeft size={12} className="mt-1 shrink-0" />
                                                    <span className="truncate">{session.description}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {isEditable && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingSession(session)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                                                    title="Modifica"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, session.id)}
                                                    disabled={deletingId === session.id}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                                    title="Elimina"
                                                >
                                                    {deletingId === session.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Dialog */}
            {editingSession && (
                <EditSessionDialog
                    session={editingSession}
                    isOpen={!!editingSession}
                    onClose={() => setEditingSession(null)}
                    onUpdate={() => router.refresh()}
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
    );
}
