/* eslint-disable sonarjs/cognitive-complexity */
import type { Buchart, PrismaClient } from '../generated/prisma/client.js';
import { getLogger } from '../logger/logger.js';

type Author = {
    name: string;
    bio: string;
};

type BookTemplate = {
    title: string;
    subtitle: string;
    keywords: string[];
    rating?: number;
    price?: number;
    discount?: number;
    art?: Buchart;
    description?: string;
};

type GenreConfig = {
    name: string;
    art: Buchart;
    baseKeywords: string[];
    basePrice: number;
    baseDiscount: number;
    descriptionTemplate: (title: string) => string;
    authors: Author[];
    titles: BookTemplate[];
};

type SeedBook = {
    isbn: string;
    titel: string;
    untertitel: string;
    rating: number;
    art: Buchart;
    preis: string;
    rabatt: string;
    lieferbar: boolean;
    datum: Date;
    homepage: string;
    schlagwoerter: string[];
    beschreibung: string;
    autor: string;
    autorBiographie: string;
};

const MIN_BOOKS = 100;
const VARIATION_SUFFIXES = ['Edition', 'Workbook', 'Companion', 'Studio'];
const VARIATION_SUBTITLE_TAGS = ['Praxis', 'Expertise', 'Neuauflage'];

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '-')
        .replaceAll(/(?:^-+)|(?:-+$)/g, '');

const formatDecimal = (value: number, fractionDigits: number) =>
    value.toFixed(fractionDigits);

const generateIsbn = (index: number) =>
    (9780006000000n + BigInt(index)).toString();

const generatePublicationDate = (index: number, genreIndex: number) => {
    const year = 2008 + ((index + genreIndex) % 16);
    const month = (index * 3 + genreIndex) % 12;
    const day = ((index + genreIndex * 7) % 27) + 1;
    return new Date(Date.UTC(year, month, day));
};

const genres: GenreConfig[] = [
    {
        name: 'IT & Software',
        art: 'HARDCOVER',
        baseKeywords: ['it', 'software', 'entwicklung'],
        basePrice: 32,
        baseDiscount: 0.08,
        descriptionTemplate: (title) =>
            `${title} verbindet praxisnahe Beispiele mit strategischem Denken und zeigt, wie moderne Teams resilienten Code entwerfen.`,
        authors: [
            {
                name: 'Dr. Helena Schwarz',
                bio: 'Softwarearchitektin und Konferenzsprecherin mit Fokus auf skalierbare Plattformen.',
            },
            {
                name: 'Luca Meier',
                bio: 'DevOps-Coach, der weltweit Cloud-Teams beim Automatisieren unterstützt.',
            },
            {
                name: 'Sofia Brandt',
                bio: 'Fullstack-Entwicklerin und Mentorin für Clean-Code-Kultur.',
            },
        ],
        titles: [
            {
                title: 'Programmieren mit TypeScript',
                subtitle: 'Moderne Frameworks meistern',
                keywords: ['typescript', 'frontend'],
                rating: 5,
                price: 34.9,
            },
            {
                title: 'Fullstack mit NestJS',
                subtitle: 'APIs, Auth und Deployment',
                keywords: ['nestjs', 'nodejs'],
            },
            {
                title: 'Moderne DevOps Pipelines',
                subtitle: 'CI/CD mit Vertrauen',
                keywords: ['devops', 'ci'],
            },
            {
                title: 'Cloud Native Architektur',
                subtitle: 'Skalierbar denken',
                keywords: ['cloud', 'architecture'],
            },
            {
                title: 'Clean Code für Teams',
                subtitle: 'Standards nachhaltig leben',
                keywords: ['clean-code', 'teamwork'],
            },
            {
                title: 'Kubernetes verständlich',
                subtitle: 'Cluster erfolgreich betreiben',
                keywords: ['kubernetes', 'containers'],
            },
            {
                title: 'GraphQL in der Praxis',
                subtitle: 'API-Design mit Fokus',
                keywords: ['graphql', 'api'],
            },
            {
                title: 'Microservices entwerfen',
                subtitle: 'Domänen sauber schneiden',
                keywords: ['microservices', 'ddd'],
            },
            {
                title: 'Secure Coding Patterns',
                subtitle: 'OWASP alltagstauglich',
                keywords: ['security', 'owasp'],
            },
            {
                title: 'Datenvisualisierung mit D3',
                subtitle: 'Storytelling mit Charts',
                keywords: ['data-vis', 'd3', 'ux'],
            },
        ],
    },
    {
        name: 'Fantasy & Sci-Fi',
        art: 'PAPERBACK',
        baseKeywords: ['fantasy', 'roman', 'abenteuer'],
        basePrice: 18,
        baseDiscount: 0.05,
        descriptionTemplate: (title) =>
            `${title} entführt Leserinnen und Leser in mehrschichtige Welten voller Magie, Intrigen und Hoffnung.`,
        authors: [
            {
                name: 'Mara Thalberg',
                bio: 'Fantasy-Autorin, die für poetische Welten und starke Figuren bekannt ist.',
            },
            {
                name: 'Jonas Adler',
                bio: 'Sci-Fi-Visionär mit Liebe zu politisch aufgeladenen Space-Operas.',
            },
            {
                name: 'Elin Falk',
                bio: 'Schriftstellerin für New-Adult-Fantasy und queere Held:innenreisen.',
            },
        ],
        titles: [
            {
                title: 'Chroniken der Nebelinseln',
                subtitle: 'Eine Legende erwacht',
                keywords: ['inseln', 'magie'],
                rating: 4,
            },
            {
                title: 'Die Hüterin der Monde',
                subtitle: 'Zwischen Licht und Schatten',
                keywords: ['monde', 'prophezeiung'],
            },
            {
                title: 'Sternenstaub Republik',
                subtitle: 'Space Opera wider das Empire',
                keywords: ['space', 'rebellion'],
            },
            {
                title: 'Die zwölf Runen',
                subtitle: 'Chronik eines verlorenen Reiches',
                keywords: ['runen', 'mittelalter'],
            },
            {
                title: 'Der letzte Drachenrufer',
                subtitle: 'Feuer im Herzen',
                keywords: ['drache', 'coming-of-age'],
            },
            {
                title: 'Wächter von Solaris',
                subtitle: 'Cyberpunk trifft Mythos',
                keywords: ['cyberpunk', 'sonne'],
            },
            {
                title: 'Das Lied des Äthers',
                subtitle: 'Sphärenmusik und Revolution',
                keywords: ['musik', 'rebellion'],
            },
            {
                title: 'Maschinenherz',
                subtitle: 'Liebe im Posthumanismus',
                keywords: ['android', 'liebe'],
            },
            {
                title: 'Die Gärten von Miraval',
                subtitle: 'Botanische Magie',
                keywords: ['natur', 'magie'],
            },
            {
                title: 'Die Schattenbibliothek',
                subtitle: 'Bücher, die antworten',
                keywords: ['bibliothek', 'mysterium'],
            },
        ],
    },
    {
        name: 'Geschichte & Politik',
        art: 'HARDCOVER',
        baseKeywords: ['geschichte', 'politik', 'zeitgeschehen'],
        basePrice: 28,
        baseDiscount: 0.07,
        descriptionTemplate: (title) =>
            `${title} verbindet akribische Recherche mit klarer Sprache und zeigt Zusammenhänge hinter aktuellen Debatten.`,
        authors: [
            {
                name: 'Prof. Daniel Krämer',
                bio: 'Zeithistoriker mit Fokus auf europäische Umbrüche.',
            },
            {
                name: 'Leyla Al-Hamid',
                bio: 'Politikwissenschaftlerin, die internationale Diplomatie analysiert.',
            },
            {
                name: 'Tobias Weigel',
                bio: 'Journalist und Dokumentarfilmer über Demokratiebewegungen.',
            },
        ],
        titles: [
            {
                title: 'Europa im Wandel',
                subtitle: 'Vom Mittelalter bis heute',
                keywords: ['europa', 'historie'],
            },
            {
                title: 'Revolutionäre Stimmen',
                subtitle: 'Manifest der Veränderung',
                keywords: ['revolution', 'politik'],
            },
            {
                title: 'Die Seidenstraße',
                subtitle: 'Globalisierung damals und heute',
                keywords: ['handel', 'asien'],
            },
            {
                title: 'Römische Strategen',
                subtitle: 'Lektionen für Führungskräfte',
                keywords: ['rom', 'führung'],
            },
            {
                title: 'Berlin 1989',
                subtitle: 'Chronik eines Herbstes',
                keywords: ['mauerfall', 'chronik'],
            },
            {
                title: 'Frieden verhandeln',
                subtitle: 'Diplomatie im 21. Jahrhundert',
                keywords: ['diplomatie', 'uno'],
            },
            {
                title: 'Koloniale Spuren',
                subtitle: 'Erinnern und Verantwortung',
                keywords: ['kolonialismus', 'diskurs'],
            },
            {
                title: 'Frauen der Geschichte',
                subtitle: 'Unsichtbare Führungskräfte',
                keywords: ['frauen', 'geschichte'],
            },
            {
                title: 'Demokratie verstehen',
                subtitle: 'Werkzeugkasten für Schulen',
                keywords: ['bildung', 'demokratie'],
            },
            {
                title: 'Weltmächte im Vergleich',
                subtitle: 'Machtprojektionen analysieren',
                keywords: ['geopolitik', 'analyse'],
            },
        ],
    },
    {
        name: 'Biographien & Memoiren',
        art: 'HARDCOVER',
        baseKeywords: ['biographie', 'memoiren'],
        basePrice: 26,
        baseDiscount: 0.06,
        descriptionTemplate: (title) =>
            `${title} erzählt von Mut, Rückschlägen und persönlichen Wendepunkten, die Leserinnen und Leser inspirieren.`,
        authors: [
            {
                name: 'Clara Wieland',
                bio: 'Ghostwriterin zahlreicher preisgekrönter Lebensgeschichten.',
            },
            {
                name: 'Marco Ruiz',
                bio: 'Reporter, der Zeitzeug:innen über Jahre begleitet.',
            },
            {
                name: 'Hannah Giese',
                bio: 'Biographin mit Fokus auf Kunst- und Sportlegenden.',
            },
        ],
        titles: [
            {
                title: 'Mein Weg durch den Ozean',
                subtitle: 'Eine Seglerin trotzt Stürmen',
                keywords: ['meer', 'abenteuer'],
            },
            {
                title: 'Zwischen Lichtern und Schatten',
                subtitle: 'Karriere einer Bühnenkünstlerin',
                keywords: ['kunst', 'theater'],
            },
            {
                title: 'Gegen jede Prognose',
                subtitle: 'Vom Außenseiter zum Visionär',
                keywords: ['vision', 'startup'],
            },
            {
                title: 'Das Archiv meines Großvaters',
                subtitle: 'Familiengeheimnisse ans Licht gebracht',
                keywords: ['familie', 'geschichte'],
            },
            {
                title: 'Die Stimme des Nordens',
                subtitle: 'Musik zwischen Protest und Poesie',
                keywords: ['musik', 'politik'],
            },
            {
                title: 'Tanz über dem Abgrund',
                subtitle: 'Ein Leben als Hochseilartistin',
                keywords: ['performance', 'mut'],
            },
            {
                title: 'Der lange Blick',
                subtitle: 'Fotografie als Lebensaufgabe',
                keywords: ['fotografie', 'reisen'],
            },
            {
                title: 'Winter im Exil',
                subtitle: 'Notizen eines Dissidenten',
                keywords: ['exil', 'politisch'],
            },
            {
                title: 'Choreografie eines Neubeginns',
                subtitle: 'Von der Bühne ins Coaching',
                keywords: ['coaching', 'entwicklung'],
            },
            {
                title: 'Grenzenlos trainieren',
                subtitle: 'Ein Leben für den Sport',
                keywords: ['sport', 'training'],
            },
        ],
    },
    {
        name: 'Nachhaltigkeit & Umwelt',
        art: 'PAPERBACK',
        baseKeywords: ['nachhaltigkeit', 'umwelt', 'klima'],
        basePrice: 24,
        baseDiscount: 0.05,
        descriptionTemplate: (title) =>
            `${title} zeigt greifbare Projekte und Strategien, mit denen Communities klimaneutral handeln.`,
        authors: [
            {
                name: 'Greta Lind',
                bio: 'Umweltjournalistin mit Fokus auf urbane Transformation.',
            },
            {
                name: 'Paul Steiner',
                bio: 'Berater für Kreislaufwirtschaft und nachhaltige Lieferketten.',
            },
            {
                name: 'Nia Okafor',
                bio: 'Aktivistin und Gründerin eines Climate-Tech-Startups.',
            },
        ],
        titles: [
            {
                title: 'Städte im Wandel',
                subtitle: 'Urban Gardening und Zukunft',
                keywords: ['urban', 'gardening'],
            },
            {
                title: 'Kreisläufe schließen',
                subtitle: 'Vom Abfall zum Wertstoff',
                keywords: ['circular', 'wirtschaft'],
            },
            {
                title: 'Küsten retten',
                subtitle: 'Community-Projekte gegen Erosion',
                keywords: ['küste', 'meer'],
            },
            {
                title: 'Solarfarmen der Nachbarschaft',
                subtitle: 'Energie teilen lernen',
                keywords: ['energie', 'solar'],
            },
            {
                title: 'Grüne Lieferketten',
                subtitle: 'Transparenz entlang des Weges',
                keywords: ['supply-chain', 'co2'],
            },
            {
                title: 'Kulinarik des Waldes',
                subtitle: 'Sammeln, Kochen, Bewahren',
                keywords: ['wald', 'rezepte'],
            },
            {
                title: 'Net-Zero Projekte',
                subtitle: 'Roadmap für Kommunen',
                keywords: ['netzero', 'kommunen'],
            },
            {
                title: 'Klima-Resiliente Architektur',
                subtitle: 'Bauen für morgen',
                keywords: ['architektur', 'resilienz'],
            },
            {
                title: 'Fair Fashion Stories',
                subtitle: 'Menschen hinter den Labels',
                keywords: ['mode', 'fair'],
            },
            {
                title: 'Rewilding Europa',
                subtitle: 'Wälder gewinnen zurück',
                keywords: ['rewilding', 'biodiversität'],
            },
        ],
    },
    {
        name: 'Business & Leadership',
        art: 'HARDCOVER',
        baseKeywords: ['business', 'leadership', 'strategie'],
        basePrice: 30,
        baseDiscount: 0.09,
        descriptionTemplate: (title) =>
            `${title} liefert Werkzeuge für moderne Organisationen, die mutig auf Zusammenarbeit und Wirkung setzen.`,
        authors: [
            {
                name: 'Verena Boldt',
                bio: 'Executive Coach mit Schwerpunkt auf New Work.',
            },
            {
                name: 'Dr. Milan Becker',
                bio: 'Organisationspsychologe und Change-Begleiter.',
            },
            {
                name: 'Aisha Grant',
                bio: 'Gründerin mehrerer Sozialunternehmen und Speakerin.',
            },
        ],
        titles: [
            {
                title: 'Führen mit Klarheit',
                subtitle: 'Feedback, Fokus, Fortschritt',
                keywords: ['führung', 'feedback'],
            },
            {
                title: 'Strategische Experimente',
                subtitle: 'Hypothesen testen im Unternehmen',
                keywords: ['strategie', 'innovation'],
            },
            {
                title: 'Remote Kulturen gestalten',
                subtitle: 'Teams über Zeitzonen verbinden',
                keywords: ['remote', 'teams'],
            },
            {
                title: 'Impact OKRs',
                subtitle: 'Messbare Ziele lebendig machen',
                keywords: ['okr', 'impact'],
            },
            {
                title: 'Nachfolge planen',
                subtitle: 'Familienunternehmen im Wandel',
                keywords: ['nachfolge', 'planung'],
            },
            {
                title: 'Verhandlungen empathisch führen',
                subtitle: 'Mehrwert durch Zuhören',
                keywords: ['verhandlung', 'empathie'],
            },
            {
                title: 'Produktstrategien schärfen',
                subtitle: 'Vom Insight zum Release',
                keywords: ['produkt', 'strategie'],
            },
            {
                title: 'Ethics by Design',
                subtitle: 'Verantwortung in Tech-Teams',
                keywords: ['ethik', 'tech'],
            },
            {
                title: 'Effektive Board-Meetings',
                subtitle: 'Rituale für Fortschritt',
                keywords: ['governance', 'meeting'],
            },
            {
                title: 'Storytelling für Pitch-Decks',
                subtitle: 'Investoren überzeugen',
                keywords: ['pitch', 'story'],
            },
        ],
    },
    {
        name: 'Wissenschaft & Gesundheit',
        art: 'PAPERBACK',
        baseKeywords: ['wissenschaft', 'gesundheit', 'studien'],
        basePrice: 27,
        baseDiscount: 0.07,
        descriptionTemplate: (title) =>
            `${title} erklärt komplexe Studien verständlich und übersetzt sie in alltagstaugliche Empfehlungen.`,
        authors: [
            {
                name: 'Prof. Alina Vogt',
                bio: 'Neuroforscherin mit Schwerpunkt Schlaf und Resilienz.',
            },
            {
                name: 'Dr. Emil Vargas',
                bio: 'Epidemiologe und Datenanalyst für öffentliche Gesundheit.',
            },
            {
                name: 'Lea Kuang',
                bio: 'Medizinjournalistin, die evidenzbasierte Inhalte kuratiert.',
            },
        ],
        titles: [
            {
                title: 'Das Mikrobiom verstehen',
                subtitle: 'Bakterien als Verbündete',
                keywords: ['mikrobiom', 'gesundheit'],
            },
            {
                title: 'Schlaf als Superkraft',
                subtitle: 'Routinen für mehr Energie',
                keywords: ['schlaf', 'routine'],
            },
            {
                title: 'Gehirn im Flow',
                subtitle: 'Konzentration trainieren',
                keywords: ['gehirn', 'flow'],
            },
            {
                title: 'Präzisionsmedizin erklärt',
                subtitle: 'Behandlung nach Maß',
                keywords: ['medizin', 'precision'],
            },
            {
                title: 'Fitness jenseits der Zahlen',
                subtitle: 'Intuitive Trainingspläne',
                keywords: ['fitness', 'training'],
            },
            {
                title: 'Ernährungsmythen enttarnt',
                subtitle: 'Wissenschaft statt Trend',
                keywords: ['ernährung', 'mythen'],
            },
            {
                title: 'Mental Health im Studium',
                subtitle: 'Werkzeuge für junge Erwachsene',
                keywords: ['mental-health', 'studium'],
            },
            {
                title: 'Digital Detox wissenschaftlich',
                subtitle: 'Bildschirmzeiten reflektieren',
                keywords: ['digital', 'detox'],
            },
            {
                title: 'Hormone im Gleichgewicht',
                subtitle: 'Lebensphasen verstehen',
                keywords: ['hormone', 'balance'],
            },
            {
                title: 'Virale Netze',
                subtitle: 'Wie Pandemien entstehen',
                keywords: ['virologie', 'netzwerk'],
            },
        ],
    },
    {
        name: 'Reisen & Kulinarik',
        art: 'PAPERBACK',
        baseKeywords: ['reisen', 'kulinarik', 'kultur'],
        basePrice: 23,
        baseDiscount: 0.04,
        descriptionTemplate: (title) =>
            `${title} kombiniert Routen, Begegnungen und Rezepte zu einem multisensorischen Reisehandbuch.`,
        authors: [
            {
                name: 'Felix Mertens',
                bio: 'Reisejournalist mit Liebe zu Bahnabenteuern.',
            },
            {
                name: 'Soraya Bell',
                bio: 'Food-Autorin, die Street-Food dokumentiert.',
            },
            {
                name: 'Ivo Hernandez',
                bio: 'Fotograf und Guide für nachhaltige Expeditionen.',
            },
        ],
        titles: [
            {
                title: 'Mit der Bahn durch Europa',
                subtitle: 'Slow-Travel-Routen',
                keywords: ['bahn', 'slow'],
            },
            {
                title: 'Märkte der Welt',
                subtitle: 'Street-Food kulinarisch',
                keywords: ['märkte', 'streetfood'],
            },
            {
                title: 'Nordische Fjordküche',
                subtitle: 'Rezepte zwischen Felsen und Meer',
                keywords: ['fjord', 'rezepte'],
            },
            {
                title: 'Sahara bei Nacht',
                subtitle: 'Nomadenwege nachzeichnen',
                keywords: ['wüste', 'nomaden'],
            },
            {
                title: 'Rucksack und Kamera',
                subtitle: 'Fototrips leicht gemacht',
                keywords: ['fotografie', 'reise'],
            },
            {
                title: 'Himalaya-Teestuben',
                subtitle: 'Geschichten aus großen Höhen',
                keywords: ['tee', 'berge'],
            },
            {
                title: 'Küstenstädte des Südens',
                subtitle: 'Architektur und Aperitivo',
                keywords: ['küste', 'aperitivo'],
            },
            {
                title: 'Radreisen Deluxe',
                subtitle: 'Bikepacking mit Stil',
                keywords: ['radreise', 'bikepacking'],
            },
            {
                title: 'Wanderdörfer Alpen',
                subtitle: 'Gipfel, Hütten, Menschen',
                keywords: ['alpen', 'wandern'],
            },
            {
                title: 'Kulinarische Inselhüpfer',
                subtitle: 'Kochen auf Segelrouten',
                keywords: ['insel', 'segeln'],
            },
        ],
    },
];

const buildSeedBooks = (): SeedBook[] => {
    const books: SeedBook[] = [];
    const usage = new Map<string, number>();

    while (books.length < MIN_BOOKS) {
        for (let genreIndex = 0; genreIndex < genres.length; genreIndex += 1) {
            if (books.length >= MIN_BOOKS) {
                break;
            }

            const genre = genres[genreIndex];
            if (!genre) {
                continue;
            }
            const usedCount = usage.get(genre.name) ?? 0;
            const template = genre.titles[usedCount % genre.titles.length];
            if (!template) {
                continue;
            }
            const variationRound = Math.floor(usedCount / genre.titles.length);
            const suffix =
                VARIATION_SUFFIXES[variationRound % VARIATION_SUFFIXES.length];
            const title =
                variationRound === 0
                    ? template.title
                    : `${template.title} – ${suffix} ${variationRound + 1}`;
            const subtitle =
                variationRound === 0
                    ? template.subtitle
                    : `${template.subtitle} · ${VARIATION_SUBTITLE_TAGS[variationRound % VARIATION_SUBTITLE_TAGS.length]}`;

            const author = genre.authors[usedCount % genre.authors.length];
            if (!author) {
                continue;
            }
            const bookIndex = books.length + 1;
            const art = template.art ?? genre.art;
            const rating =
                template.rating ?? ((bookIndex + genreIndex) % 5) + 1;
            const basePrice =
                template.price ??
                genre.basePrice +
                    (variationRound % 4) * 1.5 +
                    (bookIndex % 3) * 0.5;
            const baseDiscount =
                template.discount ??
                genre.baseDiscount + (variationRound % 4) * 0.01;
            const price = formatDecimal(basePrice, 2);
            const rabatt = formatDecimal(Math.min(baseDiscount, 0.25), 3);
            const beschreibung =
                template.description ?? genre.descriptionTemplate(title);
            const datum = generatePublicationDate(bookIndex, genreIndex);
            const homepage = `https://books.example.com/${slugify(title)}`;
            const schlagwoerter = Array.from(
                new Set([
                    ...genre.baseKeywords,
                    ...(template.keywords ?? []),
                    slugify(genre.name),
                ]),
            );

            books.push({
                isbn: generateIsbn(bookIndex),
                titel: title,
                untertitel: subtitle,
                rating,
                art,
                preis: price,
                rabatt,
                lieferbar: (bookIndex + genreIndex) % 6 !== 0,
                datum,
                homepage,
                schlagwoerter,
                beschreibung,
                autor: author.name,
                autorBiographie: author.bio,
            });

            usage.set(genre.name, usedCount + 1);
        }
    }

    return books;
};

export const seedDatabase = async (prisma: PrismaClient) => {
    const logger = getLogger('seedDatabase');
    const books = buildSeedBooks();
    logger.info('Starte Seeding mit %d Büchern', books.length);

    let inserted = 0;
    for (const book of books) {
        try {
            const exists = await prisma.buch.findUnique({
                where: { isbn: book.isbn },
            });
            if (exists) {
                logger.debug('Überspringe vorhandene ISBN=%s', book.isbn);
                continue;
            }

            const created = await prisma.buch.create({
                data: {
                    isbn: book.isbn,
                    rating: book.rating,
                    art: book.art,
                    preis: book.preis,
                    rabatt: book.rabatt,
                    lieferbar: book.lieferbar,
                    datum: book.datum,
                    homepage: book.homepage,
                    schlagwoerter: book.schlagwoerter,
                    beschreibung: book.beschreibung,
                    autor: book.autor,
                    autorBiographie: book.autorBiographie,
                    titel: {
                        create: {
                            titel: book.titel,
                            untertitel: book.untertitel,
                        },
                    },
                },
            });

            // Abbildung (Cover) mit Pfad anlegen
            try {
                await prisma.abbildung.create({
                    data: {
                        beschriftung: 'Cover',
                        contentType: 'image/svg+xml',
                        pfad: `assets/covers/${created.id}.svg`,
                        buch: { connect: { id: created.id } },
                    },
                });
            } catch (err: unknown) {
                logger.error(
                    'Fehler beim Anlegen der Abbildung für Buch %d: %o',
                    created.id,
                    err as object,
                );
            }

            inserted += 1;
            logger.info('Eingefügt: ISBN=%s', book.isbn);
        } catch (error: unknown) {
            logger.error(
                'Fehler beim Einfügen ISBN=%s: %o',
                book.isbn,
                error as object,
            );
        }
    }

    logger.info('Seeding abgeschlossen. Neu eingefügt=%d', inserted);
};

export default seedDatabase;
