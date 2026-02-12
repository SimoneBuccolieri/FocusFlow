'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className="glass px-6 py-3 rounded-full flex items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                    <span className="text-foreground dark:bg-gradient-to-r dark:from-white dark:to-white/70 dark:bg-clip-text dark:text-transparent hidden sm:inline">
                        FocusFlow
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-4">
                    <Link href="/leaderboard" className="hover:text-foreground transition-colors">
                        Leaderboard
                    </Link>
                    <Link href="/community" className="hover:text-foreground transition-colors">
                        Community
                    </Link>
                </div>

                <div className="h-6 w-px bg-white/10" />

                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <Link href="/profile" className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity">
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="w-9 h-9 rounded-full border-2 border-primary/20 ring-2 ring-primary/10"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <User size={16} />
                                    </div>
                                )}
                            </Link>

                            <ThemeToggle />

                            <button
                                onClick={() => signOut()}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-destructive"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
}
