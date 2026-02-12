'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function updateSession(sessionId: string, data: { title?: string, description?: string, checklist?: any[] }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const existingSession = await prisma.studySession.findUnique({
        where: { id: sessionId },
    })

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

    if (!existingSession || existingSession.userId !== (session.user as any).id) {
        throw new Error("Forbidden")
    }

    await prisma.studySession.delete({
        where: { id: sessionId },
    })

    revalidatePath("/")
    return { success: true }
}
