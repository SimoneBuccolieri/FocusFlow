const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Try to select the new fields from a random user or just check the model definitions if exposed (dmmf)
        // Actually, just trying a query is the best runtime check.
        const user = await prisma.user.findFirst({
            select: {
                id: true,
                theme: true,
                backgroundMode: true
            }
        });
        console.log("Successfully queried fields: theme, backgroundMode");
        console.log("User found:", user);
    } catch (e) {
        console.error("Error querying fields:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
