'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Save, Clock, Trophy } from 'lucide-react';
import { updateProfile } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Image from "next/image";

interface ProfileHeaderProps {
    user: {
        name: string | null;
        email: string | null;
        image: string | null;
    };
    stats: {
        totalHours: number;
        activeDays: number;
    };
}

function UserAvatar({ image, name, size = "md" }: { image?: string | null, name?: string | null, size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-16 h-16 text-xl",
        lg: "w-32 h-32 text-4xl"
    };

    return (
        <div className={`rounded-full overflow-hidden bg-primary/20 flex items-center justify-center border-2 border-border/50 ${sizeClasses[size]} relative`}>
            {image ? (
                <Image src={image} alt={name || "User"} fill className="object-cover" />
            ) : (
                <span className="font-bold text-primary">{name?.[0]?.toUpperCase() || "?"}</span>
            )}
        </div>
    );
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (!newName.trim()) return;

        setIsLoading(true);
        try {
            const result = await updateProfile({ name: newName });
            if (result.success) {
                setIsEditing(false);
                router.refresh();
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 md:gap-12 relative group">
            <div className="absolute top-6 right-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-white/10 rounded-full text-muted-foreground hover:text-primary transition-colors"
                    title="Edit Profile"
                >
                    <Settings size={20} />
                </button>
            </div>

            <UserAvatar image={user.image} name={user.name} size="lg" />

            <div className="text-center md:text-left space-y-4 flex-1">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight [.forest_&]:text-white">{user.name}</h1>
                    <p className="text-muted-foreground [.forest_&]:text-white/80">{user.email}</p>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 border border-white/5">
                        <Clock size={16} className="text-primary" />
                        <span className="font-semibold [.forest_&]:text-white">{stats.totalHours}</span>
                        <span className="text-muted-foreground text-sm [.forest_&]:text-white/70">hours studied</span>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 border border-white/5">
                        <Trophy size={16} className="text-yellow-500" />
                        <span className="font-semibold [.forest_&]:text-white">{stats.activeDays}</span>
                        <span className="text-muted-foreground text-sm [.forest_&]:text-white/70">days active</span>
                    </div>
                </div>
            </div>

            {/* Edit Modal - Portalled to body to match fixed positioning context */}
            {isEditing && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border/50 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4 relative">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold">Edit Profile</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-foreground"
                                    placeholder="Your name"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-xl hover:bg-muted transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || !newName.trim()}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : (
                                        <>
                                            <Save size={16} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
