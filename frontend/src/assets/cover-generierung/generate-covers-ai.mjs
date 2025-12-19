/**
 * KI-gestützte Covergenerierung (SVG-basiert, kein native Canvas nötig).
 * - Ruft optional OpenAI Image API (model=gpt-image-1) auf, falls OPENAI_API_KEY gesetzt.
 * - Bei fehlender KI: generiert abstrakten Hintergrund mit Genre-Farbkreisen.
 * - Fügt LINKS einen schmalen Farb-Streifen je Genre hinzu (Streifenbreite ~8%).
 * - Fügt Titel, Untertitel (falls vorhanden) und Autor hinzu. Kein Preis.
 * - Ausgabe als SVG unter frontend/src/assets/covers/{id}.svg
 *
 * Aufruf:
 *   pnpm run generate:covers:ai               # alle Bücher
 *   LIMIT=10 pnpm run generate:covers:ai      # nur 10 Bücher
 *
 * Voraussetzungen:
 *   - DATABASE_URL in .env
 *   - Optional OPENAI_API_KEY für KI Hintergründe
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import pg from 'pg';

const { Client } = pg;

// Genre-Slug zu Farbe für rechten Streifen
const GENRE_COLORS = {
    'it-software': '#0B5CAD',
    'fantasy-sci-fi': '#6D28D9',
    'geschichte-politik': '#8B5E3C',
    'biographien-memoiren': '#9D174D',
    'nachhaltigkeit-umwelt': '#15803D',
    'business-leadership': '#1E3A8A',
    'wissenschaft-gesundheit': '#0369A1',
    'reisen-kulinarik': '#EA580C',
};

// Prompt-Stil je Genre (nur wenn KI aktiv)
const GENRE_PROMPT_STYLE = {
    'it-software':
        'modern abstract circuit patterns, subtle neon gradients, futuristic minimal tech background, no text',
    'fantasy-sci-fi':
        'epic fantasy and sci-fi landscape, ethereal lighting, dramatic atmosphere, mist, high detail, no text',
    'geschichte-politik':
        'historical textures, archival parchment collage, subtle symbolism of political shifts, no text',
    'biographien-memoiren':
        'intimate soft portrait silhouette, warm diffused lighting, reflective mood, no text',
    'nachhaltigkeit-umwelt':
        'lush natural ecosystem, foliage, clean minimal eco aesthetics, sustainability motif, no text',
    'business-leadership':
        'geometric growth shapes, elegant minimal corporate abstract, strategic clarity, no text',
    'wissenschaft-gesundheit':
        'scientific diagrams blended with organic forms, neural patterns, clarity, no text',
    'reisen-kulinarik':
        'vibrant travel watercolor with culinary elements, route sketch, atmospheric, no text',
};

function chooseGenreSlug(keywords) {
    if (!Array.isArray(keywords)) return null;
    const slugs = Object.keys(GENRE_COLORS);
    return keywords.find((kw) => slugs.includes(kw)) || null;
}

// Einfache semantische Zuordnung deutscher Begriffe -> englische Bildkonzepte
const KEYWORD_CONCEPT_MAP = [
    [/drache|drachen/i, 'majestic dragon'],
    [/runen?/i, 'ancient runes glowing'],
    [/mond|monde/i, 'luminous moon'],
    [/stern|space|kosmos/i, 'deep space nebula'],
    [/cyber|punk/i, 'neon cyberpunk city'],
    [/bibliothek|buch/i, 'mystic library'],
    [/wald|forst/i, 'lush forest'],
    [/meer|ozean|küste|wüste/i, 'dramatic landscape'],
    [/architektur/i, 'modern architecture silhouette'],
    [/solar|energie/i, 'solar panels field'],
    [/medizin|gesundheit|hormone/i, 'scientific molecular structure'],
    [/gehirn|neuro/i, 'neural network illustration'],
    [/reise|radreise|nomaden/i, 'travel journey map'],
    [/fashion|mode/i, 'ethical fashion collage'],
    [/leadership|führung|strategie|business/i, 'abstract growth arrows'],
];

function extractConcepts(book) {
    const source = [book.titel, book.untertitel, ...(book.schlagwoerter || [])]
        .filter(Boolean)
        .join(' ');
    const concepts = [];
    for (const [regex, concept] of KEYWORD_CONCEPT_MAP) {
        if (regex.test(source)) concepts.push(concept);
        if (concepts.length >= 4) break;
    }
    return concepts;
}

function buildAiPrompt(book, genreSlug) {
    const style =
        GENRE_PROMPT_STYLE[genreSlug] ||
        'detailed thematic illustration, vertical format, no text';
    const concepts = extractConcepts(book);
    const main = concepts[0] || 'evocative symbolic centerpiece';
    const extras = concepts.slice(1).join(', ');
    const composition =
        'center or slight right focus, left edge kept clean for vertical color stripe, rich lighting, no embedded text';
    const objects = extras ? `${main}, ${extras}` : main;
    return `Highly detailed German book cover background without any text. Central motif: ${objects}. Composition: ${composition}. Genre: ${genreSlug}. Style: ${style}. Avoid letters, numbers, watermark. 2:3 aspect ratio, high resolution.`;
}

async function fetchAiImageBase64(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    try {
        const resp = await fetch('https://api.openai.com/v1/images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-image-1',
                prompt,
                size: '1024x1536',
                quality: 'standard',
            }),
        });
        if (!resp.ok) {
            console.warn('KI Antwort Fehler', await resp.text());
            return null;
        }
        const data = await resp.json();
        return data?.data?.[0]?.b64_json || null;
    } catch (err) {
        console.warn('KI Fetch Exception', err);
        return null;
    }
}

function escapeXml(s) {
    return (s || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

// Generisches geometrisches Fallback (wenn keine Konzepte erkannt)
function buildGeometricFallback(color) {
    let out = '';
    for (let i = 0; i < 6; i += 1) {
        const x = (Math.random() * 520 + 60).toFixed(1);
        const y = (Math.random() * 820 + 40).toFixed(1);
        const w = (Math.random() * 140 + 40).toFixed(1);
        const h = (Math.random() * 140 + 40).toFixed(1);
        const r = (Math.random() * 18 - 9).toFixed(1);
        out += `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${color}' fill-opacity='0.07' transform='rotate(${r} ${x} ${y})'/>`;
    }
    return out;
}

// Konzeptuelles Fallback basierend auf erstem erkannten Konzept (englisch)
function buildConceptualFallback(concepts, color) {
    if (!concepts || concepts.length === 0)
        return buildGeometricFallback(color);
    const primary = concepts[0];
    if (/dragon/i.test(primary)) {
        return `<path d='M160 640c42-150 170-250 320-260-75 32-118 86-128 129 48-22 96-27 150-16-64 37-100 74-116 126 16 5 48-5 74-11-32 58-80 100-144 121-42 16-102 26-156 21 43-31 64-63 75-105-27 11-59 17-75 0z' fill='${color}' fill-opacity='0.18'/>`;
    }
    if (/runes?/i.test(primary)) {
        return `<g stroke='${color}' stroke-width='4' stroke-opacity='0.5' fill='none'>
                    <circle cx='320' cy='460' r='130'/>
                    <path d='M320 340v240M255 430l130 70M385 430l-130 70'/>
                </g>`;
    }
    if (/moon/i.test(primary)) {
        return `<g fill='${color}' fill-opacity='0.15'>
                    <circle cx='370' cy='430' r='170'/>
                    <circle cx='430' cy='370' r='34' fill-opacity='0.28'/>
                    <circle cx='340' cy='500' r='26' fill-opacity='0.28'/>
                </g>`;
    }
    if (/forest|lush/i.test(primary)) {
        return `<g fill='${color}' fill-opacity='0.22'>
                    <polygon points='140,660 180,520 220,660'/>
                    <polygon points='220,680 270,500 320,680'/>
                    <polygon points='300,660 350,540 400,660'/>
                    <polygon points='380,680 450,480 520,680'/>
                </g>`;
    }
    if (/nebula|space/i.test(primary)) {
        return `<g fill='${color}' fill-opacity='0.12'>
                    <circle cx='270' cy='420' r='150'/>
                    <circle cx='400' cy='500' r='120' fill-opacity='0.18'/>
                    <circle cx='350' cy='350' r='80' fill-opacity='0.25'/>
                </g>`;
    }
    if (/cyberpunk|neon/i.test(primary)) {
        return `<g stroke='${color}' stroke-width='3' stroke-opacity='0.5' fill='none'>
                    <rect x='190' y='370' width='250' height='170'/>
                    <path d='M190 370l250 170M440 370L190 540'/>
                    <path d='M230 370v170M270 370v170M310 370v170M350 370v170M390 370v170'/>
                </g>`;
    }
    return buildGeometricFallback(color);
}

function pickSize(len) {
    if (len <= 18) return { fontSize: 56, maxLines: 1 };
    if (len <= 30) return { fontSize: 52, maxLines: 2 };
    if (len <= 38) return { fontSize: 48, maxLines: 2 };
    if (len <= 46) return { fontSize: 44, maxLines: 2 };
    return { fontSize: 40, maxLines: 2 };
}

function computeTitleLayout(rawTitle) {
    const title = rawTitle.trim();
    if (!title) return { fontSize: 48, lines: [''] };
    const len = title.length;
    const { fontSize, maxLines } = pickSize(len);
    const availablePx = 600 - 48 - 32 - 40; // Gesamtbreite - Streifen - linker Rand - rechter Puffer
    const avgCharPx = fontSize * 0.58; // grobe Heuristik
    const maxCharsApprox = Math.floor(availablePx / avgCharPx);
    if (maxLines === 1 && len <= maxCharsApprox)
        return { fontSize, lines: [title] };
    const words = title.split(/\s+/);
    const lines = [];
    let current = '';
    for (const w of words) {
        const cand = current ? current + ' ' + w : w;
        if (cand.length > maxCharsApprox && current) {
            lines.push(current);
            current = w;
            if (lines.length === maxLines) break;
        } else {
            current = cand;
        }
    }
    if (lines.length < maxLines && current) lines.push(current);
    if (lines.length > maxLines) lines.length = maxLines;
    const lastIdx = lines.length - 1;
    if (lines[lastIdx].length > maxCharsApprox) {
        lines[lastIdx] = lines[lastIdx].slice(0, maxCharsApprox - 1) + '…';
    }
    return { fontSize, lines };
}

function svgCover({ book, genreSlug, aiBase64 }) {
    const stripeColor = GENRE_COLORS[genreSlug] || '#7C3AED';
    const stripeWidth = 48;
    const titelEsc = escapeXml(book.titel);
    const untertitelEsc = escapeXml(book.untertitel || '');
    const autorEsc = escapeXml(book.autor);
    const layout = computeTitleLayout(titelEsc);
    const concepts = extractConcepts(book);
    const imageTag = aiBase64
        ? `<image href='data:image/png;base64,${aiBase64}' x='0' y='0' width='600' height='900' preserveAspectRatio='xMidYMid slice'/>`
        : '';
    const titleStartX = stripeWidth + 32;
    const subtitleYBase = 140 + layout.lines.length * (layout.fontSize + 8);
    const bottomBlockY = 720;
    const bottomBlockHeight = 150; // genügend Platz für 2 Textzeilen
    const titleTexts = layout.lines
        .map(
            (line, idx) =>
                `<text x='${titleStartX}' y='${110 + idx * (layout.fontSize + 8)}' font-size='${layout.fontSize}' font-weight='700'>${line}</text>`,
        )
        .join('\n    ');
    const subtitleText = untertitelEsc
        ? `<text x='${titleStartX}' y='${subtitleYBase}' font-size='28' font-style='italic'>${untertitelEsc}</text>`
        : '';
    const authorText = autorEsc ? `von ${autorEsc}` : 'Unbekannter Autor';
    const fallbackVisual = aiBase64
        ? ''
        : buildConceptualFallback(concepts, stripeColor);
    return `<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='600' height='900'>\n  <defs>\n    <linearGradient id='bg' x1='0' y='0' x2='0' y2='1'>\n      <stop offset='0%' stop-color='#111827'/>\n      <stop offset='100%' stop-color='#1F2937'/>\n    </linearGradient>\n  </defs>\n  <rect width='600' height='900' fill='url(#bg)'/>\n  ${imageTag}\n  ${fallbackVisual}\n  <rect x='0' y='0' width='${stripeWidth}' height='900' fill='${stripeColor}'/>\n  <g font-family='Arial, sans-serif' fill='white'>\n    ${titleTexts}\n    ${subtitleText}\n  </g>\n  <rect x='${stripeWidth + 20}' y='${bottomBlockY}' width='${600 - stripeWidth - 40}' height='${bottomBlockHeight}' rx='10' fill='rgba(255,255,255,0.9)'/>\n  <text x='${stripeWidth + 40}' y='${bottomBlockY + 55}' font-size='32' font-weight='700' fill='${stripeColor}' font-family='Arial, sans-serif'>${authorText}</text>\n  <text x='${stripeWidth + 40}' y='${bottomBlockY + 100}' font-size='20' fill='${stripeColor}' font-family='Arial, sans-serif'>${genreSlug || 'genre'}</text>\n</svg>`;
}

async function ensureDir(dir) {
    await mkdir(dir, { recursive: true });
}

function parseLimit() {
    if (process.env.LIMIT) {
        const v = Number.parseInt(process.env.LIMIT, 10);
        if (!Number.isNaN(v)) return v;
    }
    for (const arg of process.argv.slice(2)) {
        if (arg.startsWith('--limit=')) {
            const v = Number.parseInt(arg.split('=')[1], 10);
            if (!Number.isNaN(v)) return v;
        }
    }
    return null;
}

async function generate() {
    const limit = parseLimit();
    // Optional: distinct Genres sammeln mit --distinct=N
    let distinctCount = null;
    for (const arg of process.argv.slice(2)) {
        if (arg.startsWith('--distinct=')) {
            const v = Number.parseInt(arg.split('=')[1], 10);
            if (!Number.isNaN(v)) distinctCount = v;
        }
    }
    const targetDir = join('frontend', 'src', 'assets', 'covers');
    await ensureDir(targetDir);

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log('🔍 Verbunden mit Datenbank für AI Generation...');

    const res = await client.query(
        'SELECT id, autor, beschreibung, art, rating, homepage, schlagwoerter, isbn FROM buch ORDER BY id',
    );
    const titleRes = await client.query(
        'SELECT b.id, t.titel, t.untertitel FROM buch b JOIN titel t ON t.buch_id = b.id',
    );
    const titleMap = new Map(titleRes.rows.map((r) => [r.id, r]));

    const books = [];
    for (const row of res.rows) {
        const t = titleMap.get(row.id);
        if (!t) continue;
        books.push({ ...row, titel: t.titel, untertitel: t.untertitel });
    }
    const total = books.length;
    console.log(`📚 Bücher geladen: ${total}`);

    let selection = books;
    if (distinctCount) {
        const seen = new Set();
        const distinct = [];
        for (const b of books) {
            const slug = chooseGenreSlug(b.schlagwoerter) || 'generic';
            if (!seen.has(slug)) {
                seen.add(slug);
                distinct.push(b);
                if (distinct.length >= distinctCount) break;
            }
        }
        selection = distinct;
        console.log(`🔀 Distinct Genres gewählt: ${selection.length}`);
    }
    let processed = 0;
    const target = limit ? selection.slice(0, limit) : selection;
    for (const book of target) {
        processed += 1;
        const genreSlug = chooseGenreSlug(book.schlagwoerter);
        const prompt = buildAiPrompt(book, genreSlug);
        console.log(
            `🎨 [${processed}/${target.length}] Buch ${book.id} -> Prompt Genre=${genreSlug || 'unbekannt'}`,
        );
        const aiBase64 = await fetchAiImageBase64(prompt);
        const svg = svgCover({ book, genreSlug, aiBase64 });
        const outPath = join(targetDir, `${book.id}.svg`);
        await writeFile(outPath, svg, 'utf8');
        console.log(
            `   ✅ Gespeichert: ${book.id}.svg (${genreSlug || 'generic'})`,
        );
    }

    console.log('============================================================');
    console.log(
        `📊 Zusammenfassung: Generiert: ${processed} | Modus: ${process.env.OPENAI_API_KEY ? 'KI' : 'Fallback'}`,
    );
    console.log(`📁 Speicherort: ${targetDir}`);
    console.log('============================================================');

    await client.end();
}

try {
    await generate();
} catch (err) {
    console.error('❌ Fehler bei AI Cover Generation:', err);
    process.exit(1);
}
