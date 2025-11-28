// Script to run database seeding
import { PrismaPg } from '@prisma/adapter-pg';
import { seedDatabase } from './dist/db/seed.js';
import { PrismaClient } from './dist/generated/prisma/client.js';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prismaClient = new PrismaClient({ adapter });

try {
    console.log('Connecting to database...');
    await prismaClient.$connect();
    console.log('Connected. Starting seeding...');

    await seedDatabase(prismaClient);

    console.log('Seeding completed successfully!');
} catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
} finally {
    await prismaClient.$disconnect();
}
