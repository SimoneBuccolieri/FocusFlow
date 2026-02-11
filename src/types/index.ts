export interface Session {
    id: string;
    startTime: Date | string;
    duration: number; // Always in seconds
    title: string | null;
    description: string | null;
}

export interface ActivityData {
    date: string; // YYYY-MM-DD
    count: number; // Total minutes for the day (for coloring)
    sessions: Session[];
}
