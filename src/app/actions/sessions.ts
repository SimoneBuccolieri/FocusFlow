'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { Session, ChecklistItem } from "@/types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRecentSessions(userId: string): Promise<any[]> {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    // Use StudySession, not Session (which is for Auth)
    const sessions = await prisma.studySession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 10
    });

    return sessions.map(session => ({
        ...session,
        duration: session.durationSeconds, // Map for frontend compatibility
        checklist: Array.isArray(session.checklist) ? (session.checklist as unknown as ChecklistItem[]) : []
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserActivity(userId: string, year: number): Promise<any[]> {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const sessions = await prisma.studySession.findMany({
        where: {
            userId: userId,
            startTime: {
                gte: startDate,
                lt: endDate
            }
        },
        select: {
            id: true,
            startTime: true,
            durationSeconds: true,
            title: true,
            description: true,
            checklist: true
        },
        orderBy: { startTime: 'asc' }
    });

    // Aggregate by date
    const activityMap = new Map<string, { count: number; sessions: Session[] }>();

    sessions.forEach(session => {
        // Use local date string YYYY-MM-DD
        const date = session.startTime.toLocaleDateString('en-CA');
        let minutes = Math.round(session.durationSeconds / 60);
        if (isNaN(minutes)) minutes = 0;

        const current = activityMap.get(date) || { count: 0, sessions: [] };

        current.count += minutes;
        current.sessions.push({
            id: session.id,
            startTime: session.startTime,
            duration: session.durationSeconds,
            title: session.title,
            description: session.description,
            checklist: Array.isArray(session.checklist) ? (session.checklist as unknown as ChecklistItem[]) : []
        });

        activityMap.set(date, current);
    });

    return Array.from(activityMap.entries()).map(([date, data]) => ({
        date,
        count: data.count,
        sessions: data.sessions,
        level: data.count > 60 ? 4 : data.count > 30 ? 3 : data.count > 15 ? 2 : data.count > 0 ? 1 : 0
    }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getLeaderboard(): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7); // Last 7 days

    const topUsers = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            image: true,
            studySessions: {
                where: {
                    startTime: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    durationSeconds: true,
                    title: true,
                    startTime: true,
                },
            },
        },
        take: 50,
    });

    const leaderboard = topUsers.map((user) => {
        const totalSeconds = user.studySessions.reduce((acc, session) => acc + (session.durationSeconds || 0), 0);

        // Find most recent session for "Currently focusing on"
        const sortedSessions = [...user.studySessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        const lastSession = sortedSessions[0];

        return {
            id: user.id,
            name: user.name,
            image: user.image,
            totalMinutes: Math.floor(totalSeconds / 60),
            sessionsCount: user.studySessions.length,
            lastSessionTitle: lastSession?.title || null
        };
    })
        .filter(u => u.totalMinutes > 0)
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
        .slice(0, 50);

    return leaderboard;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateSession(sessionId: string, data: { title?: string, description?: string, checklist?: any[] }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const existingSession = await prisma.studySession.findUnique({
        where: { id: sessionId },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!existingSession || existingSession.userId !== (session.user as any).id) {
        throw new Error("Forbidden")
    }

    await prisma.studySession.update({
        where: { id: sessionId },
        data: {
            title: data.title,
            description: data.description,
            checklist: data.checklist || undefined, // Only update if provided
        },
    })

    revalidatePath("/")
    return { success: true }
}

export async function deleteSession(sessionId: string) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const existingSession = await prisma.studySession.findUnique({
        where: { id: sessionId },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!existingSession || existingSession.userId !== (session.user as any).id) {
        throw new Error("Forbidden")
    }

    await prisma.studySession.delete({
        where: { id: sessionId },
    })

    revalidatePath("/")
    return { success: true }
}
