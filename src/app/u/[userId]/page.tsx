import { getUserActivity } from "@/app/actions/sessions";
import { prisma } from "@/lib/prisma";
import { Heatmap } from "@/components/features/stats/Heatmap";
import { ClientYearSelector } from "@/components/common/ClientYearSelector";
import { notFound } from "next/navigation";
import { Clock, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProfileHeader } from "@/components/features/profile/ProfileHeader";

export default async function UserProfile({ params, searchParams }: { params: Promise<{ userId: string }>, searchParams: Promise<{ year?: string }> }) {
    const { userId } = await params;
    const { year: yearParam } = await searchParams;

    if (!userId) {
        return <div>Invalid User ID</div>;
    }

    let user;
    try {
        user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, image: true }
        });
    } catch (e) {
        console.error("Error fetching user:", e);
        return <div>Error loading profile</div>;
    }

    if (!user) {
        notFound();
    }

    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    // Safely attempt to fetch activity data
    // If unauthorized, show a friendly login message instead of crashing
    let activityData = [];
    try {
        activityData = await getUserActivity(userId, year);
    } catch (error: any) {
        if (error.message === "Unauthorized") {
            return (
                <main className="min-h-screen relative flex items-center justify-center p-4 overflow-x-hidden">
                    {/* Unique Background Effect */}
                    <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="glass p-8 md:p-12 rounded-[2.5rem] max-w-lg w-full text-center relative z-10 animate-in fade-in zoom-in-95 duration-700 border-t border-white/10 shadow-2xl">

                        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-1 mb-8 shadow-xl shadow-primary/10 relative">
                            <div className="w-full h-full rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center border border-white/5">
                                <Trophy size={40} className="text-primary opacity-80" />
                                <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full border border-white/10 shadow-lg">
                                    <Clock size={20} className="text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight mb-3 [.forest_&]:text-white">
                            View {user.name}'s Journey
                        </h1>

                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed [.forest_&]:text-white/80">
                            Join the FocusFlow community to explore detailed activity stats, track your own progress, and compete on the leaderboard.
                        </p>

                        <div className="space-y-4">
                            <Link
                                href="/auth/signin"
                                className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98]"
                            >
                                Sign In to View Profile
                            </Link>

                            <p className="text-sm text-muted-foreground [.forest_&]:text-white/60">
                                New here? <Link href="/auth/register" className="text-primary hover:underline font-medium hover:text-primary/80 transition-colors">Create an account</Link>
                            </p>
                        </div>

                        {/* Social Proof / Trust Badge (Optional Decoration) */}
                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-medium opacity-60">
                            <span>Focus</span>
                            <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                            <span>Compete</span>
                            <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                            <span>Grow</span>
                        </div>
                    </div>
                </main>
            );
        }
        console.error("Error fetching activity:", error);
        return <div>Error loading activity data</div>;
    }

    // Calculate stats
    const totalMinutes = activityData.reduce((acc: any, curr: any) => acc + curr.count, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const activeDays = activityData.filter((d: any) => d.count > 0).length;

    return (
        <main className="min-h-screen relative selection:bg-primary/30 text-foreground pb-20 overflow-x-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-4 pt-32 max-w-5xl space-y-12 relative z-10">

                {/* Profile Header */}
                <ProfileHeader
                    user={{
                        name: user.name || null,
                        email: null, // Don't show email on public profile
                        image: user.image || null
                    }}
                    stats={{
                        totalHours,
                        activeDays
                    }}
                    isReadOnly={true}
                />

                {/* Heatmap Section */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h2 className="text-xl md:text-2xl font-semibold [.forest_&]:text-white">Activity Graph</h2>
                        <div className="flex items-center bg-white/5 px-2 py-1 rounded-lg border border-white/5 w-auto justify-center">
                            <ClientYearSelector currentYear={year} />
                        </div>
                    </div>
                    {/* Read-only Heatmap */}
                    <div className="overflow-x-auto pb-4 md:overflow-visible md:pb-0 scrollbar-hide">
                        <div className=" md:min-w-0">
                            <Heatmap data={activityData} year={year} isEditable={false} />
                        </div>
                    </div>
                </div>



            </div>
        </main>
    );
}
