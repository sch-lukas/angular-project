# Regeneriere Book Cover mit vielfältiger Farbpalette
# Dieses Script erstellt SVG-Cover mit verschiedenen Farben basierend auf Genres/Kategorien

$coverDir = Join-Path $PSScriptRoot "..\frontend\src\assets\covers"

# Diverse Farbpalette für verschiedene Genres
$colors = @(
    @{ name = "Violet"; code = "#7C3AED" },     # Lila - Science Fiction
    @{ name = "Blue"; code = "#2563EB" },       # Blau - Technologie/IT
    @{ name = "Cyan"; code = "#0891B2" },       # Türkis - Wissenschaft
    @{ name = "Green"; code = "#059669" },      # Grün - Natur/Umwelt
    @{ name = "Emerald"; code = "#10B981" },    # Smaragd - Fantasy
    @{ name = "Orange"; code = "#EA580C" },     # Orange - Kochen/Reisen
    @{ name = "Red"; code = "#DC2626" },        # Rot - Thriller/Action
    @{ name = "Pink"; code = "#DB2777" },       # Pink - Romance
    @{ name = "Rose"; code = "#E11D48" },       # Rose - Drama
    @{ name = "Amber"; code = "#D97706" },      # Amber - Geschichte
    @{ name = "Indigo"; code = "#4F46E5" },     # Indigo - Mystery
    @{ name = "Teal"; code = "#0D9488" },       # Teal - Biografie
    @{ name = "Sky"; code = "#0284C7" },        # Himmelblau - Abenteuer
    @{ name = "Lime"; code = "#65A30D" },       # Limone - Humor
    @{ name = "Purple"; code = "#9333EA" },     # Lila - Magie
    @{ name = "Fuchsia"; code = "#C026D3" }     # Fuchsia - Kunst
)

# Funktion zum Generieren eines SVG-Covers
function Generate-Cover {
    param(
        [int]$BookId,
        [string]$Title,
        [string]$Subtitle,
        [string]$Author,
        [string]$Genre,
        [string]$Color
    )

    # Zufällige dekorative Rechtecke für Hintergrund
    $decorations = ""
    for ($i = 0; $i -lt 6; $i++) {
        $x = Get-Random -Minimum 50 -Maximum 600
        $y = Get-Random -Minimum 50 -Maximum 900
        $width = Get-Random -Minimum 50 -Maximum 180
        $height = Get-Random -Minimum 40 -Maximum 180
        $rotation = (Get-Random -Minimum -90 -Maximum 90) / 10.0

        $decorations += "<rect x='$x' y='$y' width='$width' height='$height' fill='$Color' fill-opacity='0.07' transform='rotate($rotation $x $y)'/>"
    }

    # Splitze Titel in Zeilen (max 3 Wörter pro Zeile)
    $titleWords = $Title -split ' '
    $titleLines = @()
    $currentLine = ""

    foreach ($word in $titleWords) {
        if ($currentLine -eq "") {
            $currentLine = $word
        } elseif (($currentLine -split ' ').Count -lt 3) {
            $currentLine += " $word"
        } else {
            $titleLines += $currentLine
            $currentLine = $word
        }
    }
    if ($currentLine -ne "") {
        $titleLines += $currentLine
    }

    # Generiere Titel-Text
    $titleText = ""
    $yPos = 110
    $fontSize = if ($titleLines.Count -eq 1) { 56 } elseif ($titleLines.Count -eq 2) { 52 } else { 48 }

    foreach ($line in $titleLines) {
        $titleText += "<text x='80' y='$yPos' font-size='$fontSize' font-weight='700'>$line</text>`n    "
        $yPos += ($fontSize + 10)
    }

    # Subtitle Position
    $subtitleY = $yPos + 40

    $svg = @"
<?xml version='1.0' encoding='UTF-8'?>
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='900'>
  <defs>
    <linearGradient id='bg' x1='0' y='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='#111827'/>
      <stop offset='100%' stop-color='#1F2937'/>
    </linearGradient>
  </defs>
  <rect width='600' height='900' fill='url(#bg)'/>

  $decorations
  <rect x='0' y='0' width='48' height='900' fill='$Color'/>
  <g font-family='Arial, sans-serif' fill='white'>
    $titleText<text x='80' y='$subtitleY' font-size='28' font-style='italic'>$Subtitle</text>
  </g>
  <rect x='68' y='720' width='512' height='150' rx='10' fill='rgba(255,255,255,0.9)'/>
  <text x='88' y='775' font-size='32' font-weight='700' fill='$Color' font-family='Arial, sans-serif'>von $Author</text>
  <text x='88' y='820' font-size='20' fill='$Color' font-family='Arial, sans-serif'>$Genre</text>
</svg>
"@

    return $svg
}

# Beispiel-Daten für Bücher (ID 1000-1158)
$books = @(
    @{ id = 1000; title = "Programmieren mit TypeScript"; subtitle = "Grundlagen und Praxis"; author = "Max Mustermann"; genre = "Technologie"; color = 1 },
    @{ id = 1001; title = "JavaScript für Anfänger"; subtitle = "Von null auf hundert"; author = "Anna Schmidt"; genre = "Programmierung"; color = 2 },
    @{ id = 1002; title = "Kochen mit Leidenschaft"; subtitle = "Mediterrane Küche"; author = "Mario Rossi"; genre = "Kochen"; color = 5 },
    @{ id = 1003; title = "Der letzte Zeuge"; subtitle = "Ein Thriller"; author = "Lisa Weber"; genre = "Thriller"; color = 6 },
    @{ id = 1004; title = "Liebe in Paris"; subtitle = "Eine Romanze"; author = "Sophie Martin"; genre = "Romance"; color = 7 },
    @{ id = 1005; title = "Die Geschichte Europas"; subtitle = "Von der Antike bis heute"; author = "Prof. Dr. Klaus"; genre = "Geschichte"; color = 9 },
    @{ id = 1006; title = "Python Mastery"; subtitle = "Advanced Programming"; author = "John Smith"; genre = "Programming"; color = 3 },
    @{ id = 1007; title = "Fantasy Welten"; subtitle = "Magische Abenteuer"; author = "Laura Green"; genre = "Fantasy"; color = 4 },
    @{ id = 1008; title = "Biografie von Einstein"; subtitle = "Genie und Mensch"; author = "Dr. Miller"; genre = "Biografie"; color = 11 }
)

# Generiere Cover für alle IDs von 1000 bis 1158
Write-Host "🎨 Regeneriere Cover mit vielfältiger Farbpalette..." -ForegroundColor Cyan

$startId = 1000
$endId = 1158
$totalBooks = $endId - $startId + 1

for ($id = $startId; $id -le $endId; $id++) {
    $progress = [math]::Round((($id - $startId + 1) / $totalBooks) * 100, 1)
    Write-Progress -Activity "Generiere Cover" -Status "$progress% ($id von $endId)" -PercentComplete $progress

    # Wähle Farbe basierend auf ID (zyklisch durch Palette)
    $colorIndex = ($id - $startId) % $colors.Count
    $color = $colors[$colorIndex].code
    $colorName = $colors[$colorIndex].name

    # Generiere abwechslungsreiche Titel
    $titleTemplates = @(
        "Das große Buch $id",
        "Meisterwerk Nr. $id",
        "Geheimnisse von $id",
        "Die Kunst des $colorName",
        "Wissen kompakt $id",
        "Klassiker Nr. $id",
        "Bestseller $id",
        "Entdecke $colorName"
    )

    $subtitleTemplates = @(
        "Ein unvergessliches Leseerlebnis",
        "Spannend von Anfang bis Ende",
        "Für Einsteiger und Profis",
        "Die ultimative Sammlung",
        "Praxisnah erklärt",
        "Mit vielen Beispielen",
        "Fundiertes Fachwissen",
        "Leicht verständlich"
    )

    $authors = @(
        "Maria Schneider", "Thomas Müller", "Anna Fischer",
        "Michael Weber", "Laura Klein", "Stefan Bauer",
        "Julia Wolf", "Peter Schmidt", "Sarah Meyer",
        "Daniel Richter", "Katharina Lang", "Martin Hoffmann"
    )

    $genres = @(
        "Roman", "Fachbuch", "Ratgeber", "Biografie",
        "Science Fiction", "Fantasy", "Thriller", "Krimi",
        "Sachbuch", "Kochen", "Reisen", "Geschichte",
        "Technologie", "Kunst", "Musik", "Sport"
    )

    # Zufällige Auswahl
    $title = $titleTemplates[$id % $titleTemplates.Count]
    $subtitle = $subtitleTemplates[(($id * 7) % $subtitleTemplates.Count)]
    $author = $authors[(($id * 3) % $authors.Count)]
    $genre = $genres[$colorIndex % $genres.Count]

    # Generiere SVG
    $svg = Generate-Cover -BookId $id -Title $title -Subtitle $subtitle -Author $author -Genre $genre -Color $color

    # Speichere Datei
    $filename = Join-Path $coverDir "$id.svg"
    $svg | Out-File -FilePath $filename -Encoding UTF8 -NoNewline
}

Write-Progress -Activity "Generiere Cover" -Completed
Write-Host "✅ $totalBooks Cover erfolgreich generiert!" -ForegroundColor Green
Write-Host "📁 Speicherort: $coverDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎨 Verwendete Farben:" -ForegroundColor Magenta
foreach ($c in $colors) {
    Write-Host "  $($c.name): $($c.code)" -ForegroundColor White
}
