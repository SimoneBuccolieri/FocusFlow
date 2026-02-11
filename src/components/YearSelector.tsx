'use client';

import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearSelectorProps {
    year: number;
    onChange: (year: number) => void;
}

export function YearSelector({ year, onChange }: YearSelectorProps) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex items-center gap-4 glass px-4 py-2 rounded-full">
            <button
                onClick={() => onChange(year - 1)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
            >
                <ChevronLeft size={20} />
            </button>

            <span className="font-mono font-medium text-lg">{year}</span>

            <button
                onClick={() => onChange(year + 1)}
                disabled={year >= currentYear}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
