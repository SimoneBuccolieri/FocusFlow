import { prisma } from "@/lib/prisma";
import { format, startOfYear, endOfYear } from "date-fns";
import { ActivityData, Session, ChecklistItem } from "@/types";

export async function getUserActivity(userId: string, year: number = new Date().getFullYear()): Promise<ActivityData[]> {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));

    const sessions = await prisma.studySession.findMany({
        where: {
            userId,
            startTime: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            id: true,
            startTime: true,
            durationSeconds: true,
            title: true,
            description: true,
            // @ts-ignore
            checklist: true,
        },
        orderBy: { startTime: 'asc' },
    });

    // Aggregate by date
    // We need to store both total count AND the list of sessions
    const activityMap = new Map<string, { count: number; sessions: Session[] }>();

    sessions.forEach((session) => {
        const date = format(session.startTime, "yyyy-MM-dd");
        const durationMins = Math.floor(session.durationSeconds / 60);

        const current = activityMap.get(date) || { count: 0, sessions: [] };

        current.count += durationMins;
        current.sessions.push({
            id: session.id,
            title: session.title,
            description: session.description,
            duration: session.durationSeconds, // Store seconds to be consistent
            startTime: session.startTime,
            checklist: Array.isArray((session as any).checklist) ? ((session as any).checklist as unknown as ChecklistItem[]) : [],
        });

        activityMap.set(date, current);
    });

    return Array.from(activityMap.entries()).map(([date, data]) => ({
        date,
        count: data.count,
        sessions: data.sessions
    }));
}

export async function getAllUsers() {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            image: true,
            email: true, // Optional: might hide this for strict privacy, but okay for now
        },
    });
}

export async function getLeaderboard() {
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

    const leaderboard = topUsers.map((user: any) => {
        const totalSeconds = user.studySessions.reduce((acc: number, session: any) => acc + session.durationSeconds, 0);

        // Find most recent session for "Currently focusing on"
        // Sort specifically for this check, though DB return order isn't guaranteed without orderBy
        const sortedSessions = [...user.studySessions].sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
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
        .slice(0, 50); // Increased limit to show more people

    return leaderboard;
}

export async function getRecentSessions(userId: string, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const sessions = await prisma.studySession.findMany({
        where: {
            userId: userId,
            startTime: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            startTime: 'desc',
        },
        select: {
            id: true,
            startTime: true,
            durationSeconds: true, // DB has durationSeconds
            title: true,
            description: true,
            // @ts-ignore
            checklist: true,
        }
    });

    return sessions.map(s => ({
        ...s,
        duration: s.durationSeconds, // Pass seconds
        checklist: Array.isArray((s as any).checklist) ? ((s as any).checklist as unknown as ChecklistItem[]) : [],
    }));
}

