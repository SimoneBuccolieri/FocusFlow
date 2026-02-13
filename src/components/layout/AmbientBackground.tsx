'use client';

import React from 'react';

interface AmbientBackgroundProps {
    className?: string;
}

export function AmbientBackground({ className }: AmbientBackgroundProps) {
    return (
        <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className} z-0`}>
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>
    );
}
