import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserActivity } from "@/app/actions/sessions";
import { prisma } from "@/lib/prisma";
import { Heatmap } from "@/components/features/stats/Heatmap";
import { ClientYearSelector } from "@/components/common/ClientYearSelector";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Clock, Trophy, Settings } from "lucide-react";
import Image from "next/image";
import { ProfileHeader } from "@/components/features/profile/ProfileHeader";



export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const userId = session.user.id;

    // Fetch fresh user data to avoid stale session data (JWT strategy)
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) return null;

    const { year: yearParam } = await searchParams;
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const activityData = await getUserActivity(userId, year);

    // Calculate stats
    const totalMinutes = activityData.reduce((acc, curr) => acc + curr.count, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const activeDays = activityData.filter(d => d.count > 0).length;

    return (
        <main className="min-h-screen relative selection:bg-primary/30 text-foreground pb-20 overflow-x-hidden">

            {/* Background Effects */}
            <AmbientBackground />

            <div className="container mx-auto px-4 pt-32 max-w-5xl space-y-12 relative z-10">

                {/* Profile Header */}
                <ProfileHeader
                    user={{
                        name: user.name || null,
                        email: user.email || null,
                        image: user.image || null
                    }}
                    stats={{
                        totalHours,
                        activeDays
                    }}
                />

                {/* Heatmap Section */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Your Activity Log</h2>
                            <div className="text-sm text-muted-foreground">
                                Click on a day to edit
                            </div>
                        </div>
                        <div className="flex items-center bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                            <ClientYearSelector currentYear={year} />
                        </div>
                    </div>
                    <Heatmap data={activityData} year={year} isEditable={true} />
                </div>

            </div>
        </main>
    );
}
