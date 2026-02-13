
import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";

import { getAllUsers } from "@/lib/data";
import Link from "next/link";
import { Search } from "lucide-react";

// Reusing simple avatar from profile page, ideally extract to component
function UserAvatar({ image, name }: { image?: string | null, name?: string | null }) {
    return (
        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border border-white/10 shrink-0">
            {image ? (
                <img src={image} alt={name || "User"} className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-primary text-sm">{name?.[0]?.toUpperCase() || "?"}</span>
            )}
        </div>
    );
}

export default async function CommunityPage() {
    const users = await getAllUsers();

    return (
        <main className="min-h-screen relative selection:bg-primary/30 text-foreground pb-20">
            <Navbar />

            {/* Ambient Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 pt-32 max-w-5xl space-y-12 relative z-10">

                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Community
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                        Connect with other focused minds. See their progress and stay motivated.
                    </p>
                </div>

                {/* Search / Filter (Visual only for now) */}
                <div className="max-w-md mx-auto relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative glass rounded-full flex items-center px-4 py-3 gap-3">
                        <Search className="text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Find a user..."
                            className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 w-full"
                        />
                    </div>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    {users.map((user) => (
                        <Link
                            key={user.id}
                            href={`/u/${user.id}`}
                            className="glass p-4 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] group"
                        >
                            <UserAvatar image={user.image} name={user.name} />
                            <div className="min-w-0">
                                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{user.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">Focused User</p>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </main>
    );
}
