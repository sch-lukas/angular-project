# Vereinfachtes Setup-Script
# Fuehrt die notwendigen Setup-Schritte nacheinander aus

Write-Host "`n=== Buchhandlung SPA - Setup ===" -ForegroundColor Cyan
Write-Host ""

# Schritt 1: Software pruefen
Write-Host "[1/6] Pruefe installierte Software..." -ForegroundColor Yellow
$hasNode = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
$hasPnpm = $null -ne (Get-Command pnpm -ErrorAction SilentlyContinue)
$hasDocker = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)

if (-not $hasNode) {
    Write-Host "  Node.js fehlt! Installiere mit: winget install OpenJS.NodeJS.LTS" -ForegroundColor Red
    Write-Host "  Dann Terminal neu starten und Script erneut ausfuehren!" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js gefunden: $(node --version)" -ForegroundColor Green

if (-not $hasPnpm) {
    Write-Host "  pnpm fehlt! Installiere jetzt..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "  pnpm installiert!" -ForegroundColor Green
}
Write-Host "  pnpm gefunden: $(pnpm --version)" -ForegroundColor Green

if (-not $hasDocker) {
    Write-Host "  Docker fehlt! Installiere mit: winget install Docker.DockerDesktop" -ForegroundColor Red
    Write-Host "  Dann Terminal neu starten und Script erneut ausfuehren!" -ForegroundColor Red
    exit 1
}
Write-Host "  Docker gefunden: $(docker --version)" -ForegroundColor Green

# Schritt 2: Konfigurationsdateien kopieren
Write-Host "`n[2/6] Kopiere Konfigurationsdateien..." -ForegroundColor Yellow

# .env Datei
if (-not (Test-Path ".env")) {
    if (Test-Path "setup-vorlagen\.env.example") {
        Copy-Item "setup-vorlagen\.env.example" ".env"
        Write-Host "  .env Datei erstellt" -ForegroundColor Green
    } else {
        Write-Host "  .env.example nicht gefunden - ueberspringe" -ForegroundColor Red
    }
} else {
    Write-Host "  .env existiert bereits" -ForegroundColor Gray
}

# DB Passwort
$dbPasswordPath = ".extras\compose\postgres\db_password.txt"
if (-not (Test-Path $dbPasswordPath)) {
    $dbPasswordDir = Split-Path $dbPasswordPath -Parent
    if (-not (Test-Path $dbPasswordDir)) {
        New-Item -ItemType Directory -Path $dbPasswordDir -Force | Out-Null
    }
    if (Test-Path "setup-vorlagen\db_password.txt.example") {
        Copy-Item "setup-vorlagen\db_password.txt.example" $dbPasswordPath
        Write-Host "  db_password.txt erstellt" -ForegroundColor Green
    } else {
        # Fallback: Erstelle mit Standard-Passwort
        "p" | Out-File -FilePath $dbPasswordPath -Encoding ascii -NoNewline
        Write-Host "  db_password.txt mit Standard-Passwort erstellt" -ForegroundColor Green
    }
} else {
    Write-Host "  db_password.txt existiert bereits" -ForegroundColor Gray
}

# Schritt 3: Dependencies installieren
Write-Host "`n[3/6] Installiere Backend Dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Backend Dependencies installiert" -ForegroundColor Green
} else {
    Write-Host "  Fehler bei Backend Dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[4/6] Installiere Frontend Dependencies..." -ForegroundColor Yellow
Push-Location frontend
pnpm install
$frontendResult = $LASTEXITCODE
Pop-Location
if ($frontendResult -eq 0) {
    Write-Host "  Frontend Dependencies installiert" -ForegroundColor Green
} else {
    Write-Host "  Fehler bei Frontend Dependencies!" -ForegroundColor Red
    exit 1
}

# Schritt 4: Prisma generieren
Write-Host "`n[5/6] Generiere Prisma Client..." -ForegroundColor Yellow
pnpm exec prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Prisma Client generiert" -ForegroundColor Green
} else {
    Write-Host "  Fehler beim Generieren des Prisma Clients!" -ForegroundColor Red
    exit 1
}

# Schritt 5: Backend bauen
Write-Host "`n[6/6] Baue Backend..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Backend gebaut" -ForegroundColor Green
} else {
    Write-Host "  Fehler beim Bauen des Backends!" -ForegroundColor Red
    exit 1
}

# Fertig
Write-Host "`n=== Setup abgeschlossen! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Starte das Projekt mit:" -ForegroundColor Cyan
Write-Host "  .\Start-All.ps1" -ForegroundColor White
Write-Host ""
