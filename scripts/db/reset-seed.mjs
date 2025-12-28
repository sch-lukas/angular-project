import { seedDatabase } from '../../dist/db/seed.js';
import { PrismaClient } from '../../src/generated/prisma/client.ts';

const prisma = new PrismaClient();

try {
    console.log('Lösche alle Bücher...');
    const deleted = await prisma.buch.deleteMany();
    console.log(`${deleted.count} Bücher gelöscht.`);

    console.log('Starte Seeding mit gültigen ISBNs...');
    await seedDatabase(prisma);
    console.log('Seeding abgeschlossen.');
} catch (error) {
    console.error('Fehler:', error);
} finally {
    await prisma.$disconnect();
}
