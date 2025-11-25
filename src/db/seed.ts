// Seed-Daten für die Beispiel-Datenbank
import type { PrismaClient } from '../generated/prisma/client.js';
import { getLogger } from '../logger/logger.js';

export const seedDatabase = async (prisma: PrismaClient) => {
    const logger = getLogger('seedDatabase');

    const books = [
        {
            isbn: '9783161484100',
            titel: 'Programmieren mit TypeScript',
            untertitel: 'Grundlagen und Praxis',
            rating: 4,
            preis: '29.90',
            rabatt: '0.100',
            lieferbar: true,
            datum: new Date('2020-01-15'),
            homepage: 'https://example.com/ts1',
            schlagwoerter: ['typescript', 'programming'],
        },
        {
            isbn: '9783161484101',
            titel: 'Einführung in NestJS',
            untertitel: 'Server-seitige Entwicklung',
            rating: 5,
            preis: '34.50',
            rabatt: '0.150',
            lieferbar: true,
            datum: new Date('2021-04-10'),
            homepage: 'https://example.com/nest1',
            schlagwoerter: ['nest', 'nodejs'],
        },
        {
            isbn: '9783161484102',
            titel: 'Datenbanken mit Prisma',
            untertitel: 'ORM praktisch',
            rating: 3,
            preis: '24.00',
            rabatt: '0.050',
            lieferbar: true,
            datum: new Date('2022-06-21'),
            homepage: 'https://example.com/prisma1',
            schlagwoerter: ['prisma', 'database'],
        },
        {
            isbn: '9783161484103',
            titel: 'Angular für Einsteiger',
            untertitel: 'Frontend mit Komponenten',
            rating: 4,
            preis: '27.50',
            rabatt: '0.120',
            lieferbar: true,
            datum: new Date('2019-11-11'),
            homepage: 'https://example.com/angular1',
            schlagwoerter: ['angular', 'frontend'],
        },
        {
            isbn: '9783161484104',
            titel: 'Sichere Webanwendungen',
            untertitel: 'Best Practices',
            rating: 5,
            preis: '39.90',
            rabatt: '0.200',
            lieferbar: true,
            datum: new Date('2018-08-05'),
            homepage: 'https://example.com/security1',
            schlagwoerter: ['security', 'web'],
        },
        {
            isbn: '9783161484105',
            titel: 'Microservices in der Praxis',
            untertitel: 'Architekturen und Patterns',
            rating: 4,
            preis: '31.00',
            rabatt: '0.080',
            lieferbar: true,
            datum: new Date('2020-03-30'),
            homepage: 'https://example.com/micro1',
            schlagwoerter: ['microservices', 'architecture'],
        },
        {
            isbn: '9783161484106',
            titel: 'Test-Driven Development',
            untertitel: 'Tests effektiv einsetzen',
            rating: 3,
            preis: '21.00',
            rabatt: '0.050',
            lieferbar: true,
            datum: new Date('2017-12-01'),
            homepage: 'https://example.com/tdd1',
            schlagwoerter: ['tdd', 'testing'],
        },
        {
            isbn: '9783161484107',
            titel: 'REST APIs gestalten',
            untertitel: 'Konventionen und Design',
            rating: 4,
            preis: '26.40',
            rabatt: '0.070',
            lieferbar: true,
            datum: new Date('2021-02-14'),
            homepage: 'https://example.com/rest1',
            schlagwoerter: ['rest', 'api'],
        },
        {
            isbn: '9783161484108',
            titel: 'GraphQL kompakt',
            untertitel: 'Abfragen effizient gestalten',
            rating: 4,
            preis: '22.00',
            rabatt: '0.060',
            lieferbar: true,
            datum: new Date('2022-09-09'),
            homepage: 'https://example.com/graphql1',
            schlagwoerter: ['graphql', 'api'],
        },
        {
            isbn: '9783161484109',
            titel: 'DevOps Grundlagen',
            untertitel: 'CI/CD und Automatisierung',
            rating: 5,
            preis: '35.00',
            rabatt: '0.150',
            lieferbar: true,
            datum: new Date('2018-04-20'),
            homepage: 'https://example.com/devops1',
            schlagwoerter: ['devops', 'ci'],
        },
        {
            isbn: '9783161484110',
            titel: 'Clean Code',
            untertitel: 'Lesbarer Code schreiben',
            rating: 5,
            preis: '29.00',
            rabatt: '0.100',
            lieferbar: true,
            datum: new Date('2008-08-01'),
            homepage: 'https://example.com/cleancode',
            schlagwoerter: ['clean', 'code'],
        },
        {
            isbn: '9783161484111',
            titel: 'Refactoring',
            untertitel: 'Verbessern vorhandenen Codes',
            rating: 4,
            preis: '33.00',
            rabatt: '0.090',
            lieferbar: true,
            datum: new Date('2012-05-15'),
            homepage: 'https://example.com/refactor',
            schlagwoerter: ['refactor', 'design'],
        },
        {
            isbn: '9783161484112',
            titel: 'Kubernetes praktisch',
            untertitel: 'Container orchestrieren',
            rating: 4,
            preis: '38.00',
            rabatt: '0.110',
            lieferbar: true,
            datum: new Date('2020-10-10'),
            homepage: 'https://example.com/k8s1',
            schlagwoerter: ['kubernetes', 'containers'],
        },
        {
            isbn: '9783161484113',
            titel: 'Agile Methoden',
            untertitel: 'Scrum und Kanban',
            rating: 3,
            preis: '18.50',
            rabatt: '0.040',
            lieferbar: true,
            datum: new Date('2016-07-07'),
            homepage: 'https://example.com/agile1',
            schlagwoerter: ['agile', 'scrum'],
        },
        {
            isbn: '9783161484114',
            titel: 'Software-Architektur',
            untertitel: 'Patterns und Prinzipien',
            rating: 5,
            preis: '41.00',
            rabatt: '0.180',
            lieferbar: true,
            datum: new Date('2015-03-03'),
            homepage: 'https://example.com/arch1',
            schlagwoerter: ['architecture', 'patterns'],
        },
        {
            isbn: '9783161484115',
            titel: 'Scripting mit Bash',
            untertitel: 'Automatisierung im Alltag',
            rating: 2,
            preis: '15.00',
            rabatt: '0.020',
            lieferbar: true,
            datum: new Date('2014-01-20'),
            homepage: 'https://example.com/bash1',
            schlagwoerter: ['bash', 'scripting'],
        },
        {
            isbn: '9783161484116',
            titel: 'Machine Learning Basics',
            untertitel: 'Algorithmen und Modelle',
            rating: 4,
            preis: '36.50',
            rabatt: '0.130',
            lieferbar: true,
            datum: new Date('2019-09-09'),
            homepage: 'https://example.com/ml1',
            schlagwoerter: ['ml', 'ai'],
        },
        {
            isbn: '9783161484117',
            titel: 'Docker kompakt',
            untertitel: 'Container-Workflows',
            rating: 3,
            preis: '19.00',
            rabatt: '0.050',
            lieferbar: true,
            datum: new Date('2018-02-02'),
            homepage: 'https://example.com/docker1',
            schlagwoerter: ['docker', 'containers'],
        },
        {
            isbn: '9783161484118',
            titel: 'Netzwerke verständlich',
            untertitel: 'Grundlagen der Netzwerktechnik',
            rating: 3,
            preis: '23.00',
            rabatt: '0.060',
            lieferbar: true,
            datum: new Date('2013-06-06'),
            homepage: 'https://example.com/net1',
            schlagwoerter: ['networking', 'tcpip'],
        },
    ];

    let inserted = 0;
    for (const b of books) {
        try {
            const exists = await prisma.buch.findUnique({
                where: { isbn: b.isbn },
            });
            if (exists) {
                logger.debug('skip existing isbn=%s', b.isbn);
                continue;
            }

            await prisma.buch.create({
                data: {
                    isbn: b.isbn,
                    rating: b.rating,
                    preis: b.preis,
                    rabatt: b.rabatt,
                    lieferbar: b.lieferbar,
                    datum: b.datum,
                    homepage: b.homepage,
                    schlagwoerter: b.schlagwoerter,
                    titel: {
                        create: { titel: b.titel, untertitel: b.untertitel },
                    },
                },
            });
            inserted += 1;
            logger.info('inserted isbn=%s', b.isbn);
        } catch (err) {
            // err ist unknown; für das Logger-API casten wir auf object
            logger.error(
                'Fehler beim Einfügen isbn=%s: %o',
                b.isbn,
                err as object,
            );
        }
    }

    logger.info(
        'Seeding finished, inserted=%d, total=%d',
        inserted,
        books.length,
    );
};

export default seedDatabase;
