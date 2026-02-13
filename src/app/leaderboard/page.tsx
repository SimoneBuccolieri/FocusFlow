import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";

import { getLeaderboard } from "@/lib/data";
import { Leaderboard } from "@/components/Leaderboard";

export default async function LeaderboardPage() {
    let leaderboard: any[] = [];
    try {
        leaderboard = await getLeaderboard();
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
    }

    return (
        <main className="min-h-screen relative selection:bg-primary/30 text-foreground pb-20">
            <Navbar />

            {/* Ambient Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 pt-32 max-w-4xl space-y-12 relative z-10">
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Weekly Leaderboard
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                        See who's focusing the most this week. Compete and stay motivated!
                    </p>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 glass p-8 rounded-[2rem] border border-black/5 dark:border-white/10 relative overflow-hidden shadow-xl dark:shadow-none bg-white/60 dark:bg-black/20">
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-md -z-10" />
                    <Leaderboard users={leaderboard} />
                </div>
            </div>
        </main>
    );
}
