import { Navbar } from "@/components/Navbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionManager } from "@/components/SessionManager";
import { getUserActivity, getRecentSessions } from "@/lib/data";
import { WeeklyProgress } from "@/components/WeeklyProgress";
import Link from "next/link";
import { Users, Trophy, ArrowRight } from "lucide-react";
import { Providers } from "@/components/Providers";

export default async function Home({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  if (!session) {
    return (
      <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
        <Navbar />

        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-6">
            FocusFlow
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/80 font-light max-w-lg mx-auto leading-relaxed mb-10">
            Master your time, visualize your progress, and join a community of focused builders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/api/auth/signin" className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-200 transition-all active:scale-95 duration-200 shadow-lg shadow-white/10">
              Get Started
            </Link>
            <Link href="/community" className="px-8 py-4 rounded-full glass hover:bg-white/10 transition-all font-medium text-lg flex items-center justify-center gap-2">
              <Users size={20} /> Community
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard Logic
  const year = params.year ? parseInt(params.year) : new Date().getFullYear();
  // We need to fetch activity using the session user's ID
  // If session.user.id is missing (type issue), we might need to fetch user by email first or fix types.
  // For now, let's assume session.user.id is available as per NextAuth callbacks we fixed.
  // If not, we fallback to email if getUserActivity supports it, but we changed it to userId.
  // Let's coerce it for now as we know we added the callback.
  const userId = (session.user as any).id;

  let activityData: any[] = [];
  let recentSessions: any[] = [];
  try {
    if (userId) {
      activityData = await getUserActivity(userId, year);
      recentSessions = await getRecentSessions(userId);
    }
  } catch (error) {
    console.error("Failed to fetch user activity:", error);
  }


  const todayStr = new Date().toISOString().split('T')[0];
  const todaysMinutes = activityData.find(d => d.date === todayStr)?.count || 0;

  return (
    <Providers>
      <main className="min-h-screen bg-background relative overflow-hidden pb-20">
        <Navbar />

        {/* Ambient Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 pt-32 max-w-5xl space-y-12 relative z-10">

          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, <span className="text-primary">{session.user?.name?.split(' ')[0]}</span></h1>
              <p className="text-muted-foreground text-lg">Ready for another productive session?</p>
            </div>

            {/* Today's Focus Widget */}
            <div className="flex justify-end">
              <div className="flex items-center gap-4 group">
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Today's Focus</div>
                  <div className={`text-4xl font-bold transition-colors duration-500 ${todaysMinutes === 0 ? "text-muted-foreground/50" :
                      todaysMinutes < 30 ? "text-emerald-600/70" :
                        todaysMinutes < 60 ? "text-emerald-500" :
                          todaysMinutes < 120 ? "text-emerald-400" :
                            "text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    }`}>
                    {todaysMinutes} <span className="text-lg font-normal opacity-60">min</span>
                  </div>
                </div>

                <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500 ${todaysMinutes === 0 ? "bg-muted/50 text-muted-foreground/30" :
                    todaysMinutes < 30 ? "bg-emerald-900/20 text-emerald-700" :
                      todaysMinutes < 60 ? "bg-emerald-900/40 text-emerald-500" :
                        todaysMinutes < 120 ? "bg-emerald-600/20 text-emerald-400" :
                          "bg-emerald-400/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  }`}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={todaysMinutes > 0 ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-500 ${todaysMinutes >= 120 ? "animate-pulse" : ""}`}
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3a1 1 0 0 1 .4-.8c.7-.6 1.9-1.3 2.5-1.9a2.5 2.5 0 0 1 .5 1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Timer Section */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <SessionManager />
          </div>

          {/* Weekly Progress Bar */}
          <WeeklyProgress data={recentSessions} />

          {/* Activity Overview (Simplified) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Link href="/profile" className="col-span-1 md:col-span-3 glass p-8 rounded-[2rem] flex items-center justify-between hover:bg-white/5 transition-all group border border-white/10 shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider">
                  <Trophy size={14} />
                  Your Progress
                </div>
                <h2 className="text-2xl font-bold">View Full Activity History</h2>
                <p className="text-muted-foreground/80 max-w-lg">
                  Check your heatmap, detailed session logs, and monthly statistics on your profile.
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center text-foreground group-hover:scale-110 transition-transform duration-300">
                <ArrowRight size={24} />
              </div>
            </Link>
          </div>

          {/* Leaderboard CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/leaderboard" className="glass p-6 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-500">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Weekly Leaderboard</h3>
                  <p className="text-muted-foreground text-sm">See who's leading the charts</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/community" className="glass p-6 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Community</h3>
                  <p className="text-muted-foreground text-sm">Explore other profiles</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </main>
    </Providers>
  );
}
