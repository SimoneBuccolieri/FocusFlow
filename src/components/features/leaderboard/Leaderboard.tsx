'use client';

import { User, Trophy, Medal, Crown, Flame, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from "next/image";

type LeaderboardUser = {
    id: string;
    name: string | null;
    image: string | null;
    totalMinutes: number;
    sessionsCount: number;
    lastSessionTitle: string | null;
};

export function Leaderboard({ users }: { users: LeaderboardUser[] }) {
    if (users.length === 0) {
        return (
            <div className="glass p-8 rounded-2xl w-full text-center text-muted-foreground">
                <p>No activity recorded this week yet. Be the first!</p>
            </div>
        );
    }

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown size={24} className="text-yellow-400 fill-yellow-400/20" />;
            case 1: return <Medal size={24} className="text-slate-300 fill-slate-300/20" />;
            case 2: return <Medal size={24} className="text-amber-600 fill-amber-600/20" />;
            default: return <span className="font-bold text-lg text-muted-foreground dark:text-slate-400 w-6 text-center">{index + 1}</span>;
        }
    };

    const getRowStyle = (index: number) => {
        if (index === 0) return "bg-yellow-500/10 border-yellow-500/20";
        if (index === 1) return "bg-slate-300/10 border-slate-300/20";
        if (index === 2) return "bg-amber-600/10 border-amber-600/20";
        return "bg-white/5 border-white/5 hover:bg-white/10";
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Trophy className="text-primary" />
                    Top Focusers
                </h3>
                <span className="text-sm text-muted-foreground bg-muted/50 dark:bg-white/5 px-3 py-1 rounded-full">
                    Last 7 Days
                </span>
            </div>

            <div className="space-y-3">
                {users.map((user, index) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                            getRowStyle(index)
                        )}
                    >
                        {/* Rank */}
                        <div className="flex items-center justify-center w-10 shrink-0">
                            {getRankIcon(index)}
                        </div>

                        {/* Avatar - Hidden on mobile, block on md+ */}
                        <div className="relative shrink-0 hidden md:block w-12 h-12">
                            {user.image ? (
                                <div className={cn(
                                    "relative w-12 h-12 rounded-full border-2 overflow-hidden",
                                    index === 0 ? "border-yellow-400 shadow-[0_0_10px_theme(colors.yellow.400)]" :
                                        index === 1 ? "border-slate-300" :
                                            index === 2 ? "border-amber-600" :
                                                "border-white/10"
                                )}>
                                    <Image
                                        src={user.image}
                                        alt={user.name || "User"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-primary bg-primary/20",
                                    index === 0 && "text-yellow-400 bg-yellow-400/20",
                                )}>
                                    <User size={20} />
                                </div>
                            )}

                            {/* Online/Active indicator */}
                            {index < 3 && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className={cn(
                                    "font-bold text-lg truncate",
                                    index === 0 ? "text-yellow-500" : "text-foreground"
                                )}>
                                    {user.name || "Anonymous User"}
                                </h4>
                                {index === 0 && <span className="absolute top-2 right-2 md:static text-[8px] md:text-[10px] uppercase font-bold bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1 py-0 md:px-1.5 md:py-0.5 rounded">Champion</span>}
                            </div>

                            {/* Last Activity / Status */}
                            {user.lastSessionTitle ? (
                                <p className="hidden md:flex text-xs text-muted-foreground items-center gap-1.5 truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                    Last: <span className="font-medium text-foreground/80 truncate">&quot;{user.lastSessionTitle}&quot;</span>
                                </p>
                            ) : (
                                <p className="hidden md:block text-xs text-muted-foreground italic">No recent sessions</p>
                            )}
                        </div>

                        {/* Stats - Right Side */}
                        <div className="flex items-center gap-4 text-right shrink-0">
                            <div className="hidden sm:block">
                                <div className="text-xs text-muted-foreground mb-0.5">Sessions</div>
                                <div className="font-semibold flex items-center justify-end gap-1">
                                    <Flame size={14} className="text-orange-500" />
                                    {user.sessionsCount}
                                </div>
                            </div>

                            <div className="md:bg-background/40 md:backdrop-blur-sm px-0 md:px-4 py-0 md:py-2 rounded-xl md:border md:border-white/5 min-w-[60px] md:min-w-[100px]">
                                <div className="hidden md:block text-[10px] md:text-xs text-muted-foreground mb-0.5 text-center uppercase tracking-wider font-medium">Time</div>
                                <div className="font-bold text-lg md:text-xl flex items-center justify-center gap-1">
                                    <Clock size={14} className="text-primary md:w-4 md:h-4" />
                                    {Math.floor(user.totalMinutes / 60)}<span className="text-xs md:text-sm font-normal text-muted-foreground">h</span> {user.totalMinutes % 60}<span className="text-xs md:text-sm font-normal text-muted-foreground">m</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
