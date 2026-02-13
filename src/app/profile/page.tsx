import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserActivity } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { Heatmap } from "@/components/Heatmap";
import { ClientYearSelector } from "@/components/ClientYearSelector";
import { Navbar } from "@/components/Navbar";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Clock, Trophy, Settings, User } from "lucide-react";
import Link from "next/link";
import { Providers } from "@/components/Providers";

function UserAvatar({ image, name, size = "md" }: { image?: string | null, name?: string | null, size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-16 h-16 text-xl",
        lg: "w-32 h-32 text-4xl"
    };

    return (
        <div className={`rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border-2 border-border/50 ${sizeClasses[size]}`}>
            {image ? (
                <img src={image} alt={name || "User"} className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-primary">{name?.[0]?.toUpperCase() || "?"}</span>
            )}
        </div>
    );
}

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const userId = session.user.id;
    const { year: yearParam } = await searchParams;
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const activityData = await getUserActivity(userId, year);

    // Calculate stats
    const totalMinutes = activityData.reduce((acc, curr) => acc + curr.count, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const activeDays = activityData.filter(d => d.count > 0).length;

    return (
        <Providers>
            <main className="min-h-screen relative selection:bg-primary/30 text-foreground pb-20 overflow-x-hidden">
                <Navbar />

                {/* Background Effects */}
                <AmbientBackground />

                <div className="container mx-auto px-4 pt-32 max-w-5xl space-y-12 relative z-10">

                    {/* Profile Header */}
                    <div className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative group">
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-primary transition-colors" title="Settings (Coming Soon)">
                                <Settings size={20} />
                            </button>
                        </div>

                        <UserAvatar image={session.user.image} name={session.user.name} size="lg" />

                        <div className="text-center md:text-left space-y-4 flex-1">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight">{session.user.name}</h1>
                                <p className="text-muted-foreground">{session.user.email}</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 border border-white/5">
                                    <Clock size={16} className="text-primary" />
                                    <span className="font-semibold">{totalHours}</span>
                                    <span className="text-muted-foreground text-sm">hours studied</span>
                                </div>
                                <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 border border-white/5">
                                    <Trophy size={16} className="text-yellow-500" />
                                    <span className="font-semibold">{activeDays}</span>
                                    <span className="text-muted-foreground text-sm">days active</span>
                                </div>
                            </div>
                        </div>


                    </div>

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
        </Providers>
    );
}
