# copy-to-project.ps1
# Kopiert alle Setup-Vorlagen an die richtigen Stellen im Projekt
#
# Verwendung: .\setup-vorlagen\copy-to-project.ps1

param(
    [switch]$Force  # Überschreibt existierende Dateien
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$VorlagenDir = $PSScriptRoot

Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         📁 Setup-Vorlagen kopieren                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

function Copy-Template {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Description
    )

    $sourcePath = Join-Path $VorlagenDir $Source
    $destPath = Join-Path $ProjectRoot $Destination

    # Zielverzeichnis erstellen falls nicht vorhanden
    $destDir = Split-Path -Parent $destPath
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    if (Test-Path $destPath) {
        if ($Force) {
            Copy-Item $sourcePath $destPath -Force
            Write-Host "  ⚠️  $Description - überschrieben" -ForegroundColor Yellow
        } else {
            Write-Host "  ⏭️  $Description - existiert bereits (--Force zum Überschreiben)" -ForegroundColor DarkGray
        }
    } else {
        Copy-Item $sourcePath $destPath
        Write-Host "  ✅ $Description" -ForegroundColor Green
    }
}

function Ensure-TlsCertificates {
    param([string]$Root)
    $tlsDir = Join-Path $Root "src\config\resources\tls"
    $keyPath = Join-Path $tlsDir "key.pem"
    $certPath = Join-Path $tlsDir "certificate.crt"

    if ((Test-Path $keyPath) -and (Test-Path $certPath)) {
        Write-Host "  ✅ TLS key.pem/certificate.crt - bereits vorhanden" -ForegroundColor Green
        return
    }

    if (-not (Test-Path $tlsDir)) {
        New-Item -ItemType Directory -Path $tlsDir -Force | Out-Null
    }

    Write-Host "  ⏳ Generiere TLS Zertifikate..." -ForegroundColor Yellow
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        & openssl req -x509 -newkey rsa:4096 -keyout $keyPath -out $certPath -days 365 -nodes -subj "/CN=localhost" | Out-Null
        Write-Host "  ✅ TLS Zertifikate mit openssl erstellt" -ForegroundColor Green
        return
    }

    $tlsDirForDocker = (Resolve-Path $tlsDir).Path -replace '\\', '/'
    docker run --rm -v "${tlsDirForDocker}:/tls" alpine/openssl req -x509 -newkey rsa:4096 -keyout /tls/key.pem -out /tls/certificate.crt -days 365 -nodes -subj "/CN=localhost" | Out-Null
    Write-Host "  ✅ TLS Zertifikate mit Docker/openssl erstellt" -ForegroundColor Green
}

Write-Host "`n📋 Kopiere Dateien...`n" -ForegroundColor White

# .env Datei
Copy-Template -Source ".env.example" -Destination ".env" -Description ".env (Umgebungsvariablen)"

# PostgreSQL Passwort
Copy-Template -Source "db_password.txt.example" -Destination ".extras\compose\postgres\db_password.txt" -Description "db_password.txt (PostgreSQL)"

# TLS Zertifikate
Ensure-TlsCertificates -Root $ProjectRoot

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ Fertig!                             ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n💡 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "   1. pnpm install" -ForegroundColor White
Write-Host "   2. cd frontend && pnpm install && cd .." -ForegroundColor White
Write-Host "   3. pnpm exec prisma generate" -ForegroundColor White
Write-Host "   4. pnpm build" -ForegroundColor White
Write-Host "   5. .\Start-All.ps1" -ForegroundColor White
Write-Host ""
