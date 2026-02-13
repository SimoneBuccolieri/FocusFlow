'use client';

import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearSelectorProps {
    year: number;
    onChange: (year: number) => void;
}

export function YearSelector({ year, onChange }: YearSelectorProps) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onChange(year - 1)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
            >
                <ChevronLeft size={16} />
            </button>

            <span className="font-mono font-medium text-sm text-muted-foreground w-12 text-center">{year}</span>

            <button
                onClick={() => onChange(year + 1)}
                disabled={year >= currentYear}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
