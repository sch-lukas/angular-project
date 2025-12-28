import { PrismaClient } from '../../dist/generated/prisma/client.js';

const prisma = new PrismaClient();

try {
    const buecher = await prisma.buch.findMany({
        select: { id: true, isbn: true },
        take: 20,
        orderBy: { id: 'asc' },
    });
    console.log('Erste 20 Bücher:');
    buecher.forEach((b) => console.log(`ID: ${b.id}, ISBN: ${b.isbn}`));

    // Check ISBN validity
    const { default: isISBN } = await import('validator/lib/isISBN.js');
    const validCount = buecher.filter((b) => isISBN(b.isbn, 13)).length;
    console.log(`\nGültige ISBNs: ${validCount}/${buecher.length}`);
} finally {
    await prisma.$disconnect();
}
