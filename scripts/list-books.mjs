const pkg = await import('@prisma/client');
const PrismaClientCtor =
    pkg?.PrismaClient ?? pkg?.default?.PrismaClient ?? pkg?.default;
if (!PrismaClientCtor) {
    console.error('PrismaClient konnte nicht geladen werden.');
    process.exit(1);
}

const prisma = new PrismaClientCtor();
try {
    const buecher = await prisma.buch.findMany({
        take: 10,
        include: { titel: true },
    });
    console.log(JSON.stringify(buecher, null, 2));
} catch (err) {
    console.error('Fehler beim Lesen der Bücher:', err);
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
}
