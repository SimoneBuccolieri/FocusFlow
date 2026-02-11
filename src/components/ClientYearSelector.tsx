'use client';

import { useRouter, usePathname } from 'next/navigation';
import { YearSelector } from './YearSelector';

export function ClientYearSelector({ currentYear }: { currentYear: number }) {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <YearSelector
            year={currentYear}
            onChange={(y) => {
                router.replace(`${pathname}?year=${y}`, { scroll: false });
            }}
        />
    );
}
