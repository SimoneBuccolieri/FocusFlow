import { getUserActivity } from "@/app/actions/sessions";
import { prisma } from "@/lib/prisma";
import { Heatmap } from "@/components/features/stats/Heatmap";
import { ClientYearSelector } from "@/components/common/ClientYearSelector";
import { notFound } from "next/navigation";
import { Clock, Trophy } from "lucide-react";
import Image from "next/image";

// Quick Avatar component since we might not have shadcn/ui generic one verified
function UserAvatar({ image, name, size = "md" }: { image?: string | null, name?: string | null, size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-16 h-16 text-xl",
        lg: "w-32 h-32 text-4xl"
    };

    return (
        <div className={`rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border-2 border-white/10 ${sizeClasses[size]} relative`}>
            {image ? (
                <Image src={image} alt={name || "User"} fill className="object-cover" />
            ) : (
                <span className="font-bold text-primary">{name?.[0]?.toUpperCase() || "?"}</span>
            )}
        </div>
    );
}

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
    const activityData = await getUserActivity(userId, year);

    // Calculate stats
    const totalMinutes = activityData.reduce((acc, curr) => acc + curr.count, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const activeDays = activityData.filter(d => d.count > 0).length;

    return (
        <main className="min-h-screen relative selection:bg-primary/30 text-foreground pb-20">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-4 pt-32 max-w-5xl space-y-12 relative z-10">

                {/* Profile Header */}
                <div className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <UserAvatar image={user.image} name={user.name} size="lg" />

                    <div className="text-center md:text-left space-y-4 flex-1">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">{user.name}</h1>
                            {/* Member since removed as createdAt is not in model */}
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
                        <h2 className="text-2xl font-semibold">Activity Graph</h2>
                        <div className="flex items-center bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                            <ClientYearSelector currentYear={year} />
                        </div>
                    </div>
                    {/* Read-only Heatmap */}
                    <Heatmap data={activityData} year={year} isEditable={false} />
                </div>



            </div>
        </main>
    );
}
