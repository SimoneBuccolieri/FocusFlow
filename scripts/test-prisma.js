const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst();
        if (user) {
            console.log("User found. Keys:", Object.keys(user));
            if ('theme' in user && 'backgroundMode' in user) {
                console.log("SUCCESS: theme and backgroundMode fields exist.");
            } else {
                console.error("FAILURE: Fields missing from user object.");
            }
        } else {
            // If no user, we can't fully verify runtime fields but at least no crash
            console.log("No user found, but client initialized.");
        }
    } catch (e) {
        console.error("Error querying:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
