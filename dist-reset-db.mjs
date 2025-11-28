import { seedDatabase } from './dist/db/seed.js';
import { PrismaClient } from './dist/generated/prisma/client.js';

const prisma = new PrismaClient();

async function resetDatabase() {
    try {
        console.log('Lösche alle Bücher...');
        const deleted = await prisma.buch.deleteMany();
        console.log(`${deleted.count} Bücher gelöscht.`);

        console.log('Starte Seeding...');
        await seedDatabase(prisma);
        console.log('Seeding abgeschlossen.');
    } catch (error) {
        console.error('Fehler:', error);
    } finally {
        await prisma.$disconnect();
    }
}

await resetDatabase();
