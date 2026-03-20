# Vereinfachtes Setup-Script
# Fuehrt die notwendigen Setup-Schritte nacheinander aus

Write-Host "`n=== Buchhandlung SPA - Setup ===" -ForegroundColor Cyan
Write-Host ""

function Get-EnvValue {
    param([string]$Name, [string]$EnvPath)
    if (-not (Test-Path $EnvPath)) {
        return $null
    }
    $line = Get-Content $EnvPath | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1
    if (-not $line) {
        return $null
    }
    return ($line -split '=', 2)[1]
}

function Set-EnvValue {
    param([string]$Name, [string]$Value, [string]$EnvPath)
    if (-not (Test-Path $EnvPath)) {
        return
    }
    $content = Get-Content $EnvPath -Raw
    if ($content -match "(?m)^$Name=") {
        $updated = [regex]::Replace($content, "(?m)^$Name=.*$", "$Name=$Value")
    } else {
        $updated = "$content`r`n$Name=$Value`r`n"
    }
    Set-Content -Path $EnvPath -Value $updated -Encoding UTF8
}

function New-RandomSecret {
    $chars = (48..57) + (65..90) + (97..122)
    return -join ($chars | Get-Random -Count 32 | ForEach-Object { [char]$_ })
}

function Ensure-TlsCertificates {
    param([string]$Root)
    $tlsDir = Join-Path $Root "src\config\resources\tls"
    $keyFile = Join-Path $tlsDir "key.pem"
    $certFile = Join-Path $tlsDir "certificate.crt"

    if ((Test-Path $keyFile) -and (Test-Path $certFile)) {
        Write-Host "  TLS Zertifikate bereits vorhanden" -ForegroundColor Gray
        return
    }

    if (-not (Test-Path $tlsDir)) {
        New-Item -ItemType Directory -Path $tlsDir -Force | Out-Null
    }

    Write-Host "  TLS Zertifikate werden erstellt..." -ForegroundColor Yellow
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        & openssl req -x509 -newkey rsa:4096 -keyout $keyFile -out $certFile -days 365 -nodes -subj "/CN=localhost" | Out-Null
        Write-Host "  TLS Zertifikate mit openssl erstellt" -ForegroundColor Green
        return
    }

    $tlsDirForDocker = (Resolve-Path $tlsDir).Path -replace '\\', '/'
    docker run --rm -v "${tlsDirForDocker}:/tls" alpine/openssl req -x509 -newkey rsa:4096 -keyout /tls/key.pem -out /tls/certificate.crt -days 365 -nodes -subj "/CN=localhost" | Out-Null
    Write-Host "  TLS Zertifikate mit Docker/openssl erstellt" -ForegroundColor Green
}

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

$envPath = ".env"
if (Test-Path $envPath) {
    $clientSecret = Get-EnvValue -Name "CLIENT_SECRET" -EnvPath $envPath
    if ([string]::IsNullOrWhiteSpace($clientSecret) -or $clientSecret -like "__SET_*" -or $clientSecret -like "CHANGE_ME*") {
        $clientSecret = New-RandomSecret
        Set-EnvValue -Name "CLIENT_SECRET" -Value $clientSecret -EnvPath $envPath
        Set-EnvValue -Name "KEYCLOAK_CLIENT_SECRET" -Value $clientSecret -EnvPath $envPath
        Write-Host "  CLIENT_SECRET wurde sicher generiert" -ForegroundColor Green
    }

    $adminPassword = Get-EnvValue -Name "KEYCLOAK_ADMIN_PASSWORD" -EnvPath $envPath
    if ([string]::IsNullOrWhiteSpace($adminPassword) -or $adminPassword -like "CHANGE_ME*") {
        $adminPassword = Read-Host "  Keycloak Admin Passwort eingeben"
        if (-not [string]::IsNullOrWhiteSpace($adminPassword)) {
            Set-EnvValue -Name "KEYCLOAK_ADMIN_PASSWORD" -Value $adminPassword -EnvPath $envPath
        }
    }

    $appPassword = Get-EnvValue -Name "KEYCLOAK_APP_PASSWORD" -EnvPath $envPath
    if ([string]::IsNullOrWhiteSpace($appPassword) -or $appPassword -like "CHANGE_ME*") {
        $appPassword = Read-Host "  Keycloak App Passwort (admin/user) eingeben"
        if (-not [string]::IsNullOrWhiteSpace($appPassword)) {
            Set-EnvValue -Name "KEYCLOAK_APP_PASSWORD" -Value $appPassword -EnvPath $envPath
        }
    }
}

Ensure-TlsCertificates -Root $PSScriptRoot

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
