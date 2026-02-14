import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionManager } from "@/components/features/session/SessionManager";
import { getUserActivity, getRecentSessions } from "@/app/actions/sessions";
import { WeeklyProgress } from "@/components/features/stats/WeeklyProgress";
import Link from "next/link";
import { Users, Trophy, ArrowRight } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { DailyFocusWidget } from "@/components/features/stats/DailyFocusWidget";

import { prisma } from "@/lib/prisma";

export default async function Home({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;

  let userName = session?.user?.name;

  if (session?.user?.id) {
    // Fetch fresh user data to get updated name
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    });
    if (user?.name) {
      userName = user.name;
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen relative overflow-hidden flex flex-col">

        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-lg mb-6">
            FocusFlow
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-lg mx-auto leading-relaxed mb-10 drop-shadow-md">
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any).id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activityData: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentSessions: any[] = [];
  try {
    if (userId) {
      activityData = await getUserActivity(userId, year);
      recentSessions = await getRecentSessions(userId);
    }
  } catch (error) {
    console.error("Failed to fetch user activity:", error);
  }


  // Fix: Use local date string to match data.ts aggregation
  const todayStr = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD local time
  // Fix: Ensure we never return NaN
  const todayEntry = activityData.find((d: any) => d.date === todayStr);
  const rawMinutes = todayEntry?.count;

  console.log('--- DEBUG TODAY FOCUS ---');
  console.log('todayStr:', todayStr);
  console.log('todayEntry:', JSON.stringify(todayEntry));
  console.log('rawMinutes:', rawMinutes, 'typeof:', typeof rawMinutes);

  const todaysMinutes = (typeof rawMinutes === 'number' && !isNaN(rawMinutes)) ? rawMinutes : 0;
  console.log('todaysMinutes (calculated):', todaysMinutes);
  console.log('-------------------------');

  return (
    <main className="min-h-screen relative overflow-hidden pb-20">
      {/* Ambient Glow */}
      <AmbientBackground />

      <div className="container mx-auto px-4 pt-32 max-w-5xl space-y-12 relative z-10 w-full overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 [.forest_&]:text-white">Welcome back, <span className="text-primary">{userName?.split(' ')[0]}</span></h1>
            <p className="text-muted-foreground text-lg [.forest_&]:text-white/80">Ready for another productive session?</p>
          </div>

          {/* Today's Focus Widget */}
          <div className="flex justify-end">
            <DailyFocusWidget minutes={todaysMinutes} />
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
                <p className="text-muted-foreground text-sm">See who&apos;s leading the charts</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="glass p-6 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group relative">
            <Link href="/community" className="absolute inset-0 z-0" aria-label="Go to Community" />

            <div className="flex items-center gap-4 relative z-10 pointer-events-none">
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-500 pointer-events-auto">
                {((session as unknown) as { user: { id: string } })?.user?.id ? (
                  <Link
                    href={`/u/${((session as unknown) as { user: { id: string } }).user.id}`}
                    className="flex items-center justify-center h-full w-full hover:scale-110 transition-transform"
                    aria-label="Your Profile"
                  >
                    <Users size={24} />
                  </Link>
                ) : (
                  <Users size={24} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Community</h3>
                <p className="text-muted-foreground text-sm">Explore other profiles</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform relative z-0" />
          </div>
        </div>


      </div>
    </main>
  );
}
