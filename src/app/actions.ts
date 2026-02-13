'use server';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveSession(data: {
    durationSeconds: number;
    title?: string;
    description?: string;
    privateNotes?: string;
    checklist?: any[]; // Using any[] to match Prisma Json input, but strictly typed in frontend
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("Unauthorized");
    }

    // Ensure user exists (NextAuth usually handles this but good to be safe with relations)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        throw new Error("User not found");
    }

    await prisma.studySession.create({
        data: {
            userId: user.id,
            startTime: new Date(Date.now() - data.durationSeconds * 1000), // Approx start time
            endTime: new Date(),
            durationSeconds: data.durationSeconds,
            title: data.title,
            description: data.description,
            privateNotes: data.privateNotes,
            checklist: data.checklist || [],
        },
    });

    revalidatePath('/');
}

export async function deleteSession(sessionId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Verify ownership
    const studySession = await prisma.studySession.findUnique({
        where: { id: sessionId },
        select: { userId: true }
    });

    if (!studySession) {
        throw new Error("Session not found");
    }

    if (studySession.userId !== user.id) {
        throw new Error("Unauthorized");
    }

    await prisma.studySession.delete({
        where: { id: sessionId }
    });

    revalidatePath('/');
    revalidatePath('/profile'); // Revalidate profile as well just in case
}

// Update user preferences (theme/background)
export async function updateUserPreferences(key: 'theme' | 'backgroundMode', value: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    // Validate key to prevent arbitrary field updates
    if (key !== 'theme' && key !== 'backgroundMode') {
        throw new Error("Invalid preference key");
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: { [key]: value },
        });
        revalidatePath('/'); // Revalidate to reflect changes if needed server-side
        return { success: true };
    } catch (error) {
        console.error("Failed to update preferences:", error);
        return { success: false, error: "Failed to update preferences" };
    }
}
