import { PrismaClient } from './src/generated/prisma/client.ts';
import { seedDatabase } from './src/db/seed.ts';

const prisma = new PrismaClient();

async function resetDatabase() {
    try {
        console.log('Lösche alle Bücher...');
        const deleted = await prisma.buch.deleteMany();
        console.log({deleted.count} Bücher gelöscht.);
        
        console.log('Starte Seeding...');
        await seedDatabase(prisma);
        console.log('Seeding abgeschlossen.');
    } catch (error) {
        console.error('Fehler:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
