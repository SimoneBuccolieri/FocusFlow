export interface Session {
    id: string;
    startTime: Date | string;
    duration: number; // Always in seconds
    title: string | null;
    description: string | null;
    checklist?: ChecklistItem[] | null;
}

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface ActivityData {
    date: string; // YYYY-MM-DD
    count: number; // Total minutes for the day (for coloring)
    sessions: Session[];
}
