import { getLeaderboard } from "@/app/actions/sessions";
import Link from 'next/link';
import { User } from 'lucide-react';
import Image from "next/image";

export const dynamic = "force-dynamic";

// Reusing simple avatar from profile page, ideally extract to component
export default async function CommunityPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let users: any[] = [];
    try {
        users = await getLeaderboard();
    } catch (error) {
        console.error("Failed to fetch community:", error);
    }

    return (
        <main className="min-h-screen relative selection:bg-primary/30 text-foreground pb-20">
            {/* Ambient Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 pt-32 max-w-6xl space-y-12 relative z-10">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                        Community
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                        Connect with other builders found their flow.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {users.map((user) => (
                        <Link href={`/u/${user.id}`} key={user.id} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="glass p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all h-full flex flex-col items-center text-center gap-4 relative overflow-hidden">

                                <div className="relative w-24 h-24 rounded-full border-4 border-white/5 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    {user.image ? (
                                        <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
                                            <User size={40} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg truncate w-full">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.totalMinutes ? Math.round(user.totalMinutes / 60) : 0} hours focused</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
