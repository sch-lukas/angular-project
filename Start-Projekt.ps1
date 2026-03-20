# Start-Projekt.ps1 - Startet Backend, Frontend und optional Tunnel
param(
    [switch]$tunnel
)

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot

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

function Ensure-TlsCertificates {
    param([string]$Root)
    $tlsDir = Join-Path $Root "src\config\resources\tls"
    $keyFile = Join-Path $tlsDir "key.pem"
    $certFile = Join-Path $tlsDir "certificate.crt"

    if ((Test-Path $keyFile) -and (Test-Path $certFile)) {
        return
    }

    if (-not (Test-Path $tlsDir)) {
        New-Item -ItemType Directory -Path $tlsDir -Force | Out-Null
    }

    Write-Host "  TLS-Zertifikate fehlen - generiere lokal..." -ForegroundColor Gray
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        & openssl req -x509 -newkey rsa:4096 -keyout $keyFile -out $certFile -days 365 -nodes -subj "/CN=localhost" | Out-Null
        return
    }

    $tlsDirForDocker = (Resolve-Path $tlsDir).Path -replace '\\', '/'
    docker run --rm -v "${tlsDirForDocker}:/tls" alpine/openssl req -x509 -newkey rsa:4096 -keyout /tls/key.pem -out /tls/certificate.crt -days 365 -nodes -subj "/CN=localhost" | Out-Null
}

function Ensure-KeycloakAdminPassword {
    param([string]$Root)
    $envPath = Join-Path $Root ".env"
    $adminPassword = Get-EnvValue -Name "KEYCLOAK_ADMIN_PASSWORD" -EnvPath $envPath

    if ([string]::IsNullOrWhiteSpace($adminPassword) -or $adminPassword -like "CHANGE_ME*") {
        $adminPassword = Read-Host "Keycloak Admin Passwort eingeben (wird in .env gespeichert)"
        if (-not [string]::IsNullOrWhiteSpace($adminPassword)) {
            Set-EnvValue -Name "KEYCLOAK_ADMIN_PASSWORD" -Value $adminPassword -EnvPath $envPath
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($adminPassword)) {
        $env:KEYCLOAK_ADMIN_PASSWORD = $adminPassword
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Buchhandlung SPA - Start Script    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Ensure-TlsCertificates -Root $ProjectRoot
Ensure-KeycloakAdminPassword -Root $ProjectRoot

# Pruefe Docker Container
Write-Host "[1/4] Pruefe Docker Container..." -ForegroundColor Yellow
$postgres = docker ps --filter "name=postgres" --format "{{.Status}}" 2>$null
$keycloak = docker ps --filter "name=keycloak" --format "{{.Status}}" 2>$null

if (-not $postgres) {
    Write-Host "  PostgreSQL nicht gefunden - starte..." -ForegroundColor Gray
    docker compose -f "$ProjectRoot\.extras\compose\postgres\compose-simple.yml" up -d
}
else {
    Write-Host "  PostgreSQL laeuft" -ForegroundColor Green
}

if (-not $keycloak) {
    Write-Host "  Keycloak nicht gefunden - starte..." -ForegroundColor Gray
    docker compose -f "$ProjectRoot\.extras\compose\keycloak\compose-simple.yml" up -d
    Start-Sleep -Seconds 10
}
else {
    Write-Host "  Keycloak laeuft" -ForegroundColor Green
}

# Backend starten
Write-Host ""
Write-Host "[2/4] Starte Backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location $root
    $env:NODE_ENV = "development"
    node dist/main.js 2>&1
} -ArgumentList $ProjectRoot

Start-Sleep -Seconds 3
Write-Host "  Backend gestartet (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Frontend starten
Write-Host ""
Write-Host "[3/4] Starte Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location "$root\frontend"
    pnpm start 2>&1
} -ArgumentList $ProjectRoot

Start-Sleep -Seconds 5
Write-Host "  Frontend gestartet (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Tunnel starten (optional)
if ($tunnel) {
    Write-Host ""
    Write-Host "[4/4] Starte Cloudflare Tunnel..." -ForegroundColor Yellow

    $cloudflared = "$env:USERPROFILE\cloudflared.exe"
    if (-not (Test-Path $cloudflared)) {
        Write-Host "  cloudflared nicht gefunden! Bitte installieren:" -ForegroundColor Red
        Write-Host '  Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "$env:USERPROFILE\cloudflared.exe"' -ForegroundColor Gray
    }
    else {
        Start-Process -FilePath $cloudflared -ArgumentList "tunnel", "--url", "http://localhost:4200" -NoNewWindow
        Write-Host "  Tunnel gestartet - URL wird in separatem Fenster angezeigt" -ForegroundColor Green
    }
}

# Zusammenfassung
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "         Projekt gestartet!            " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend:  https://localhost:3000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "  Keycloak: http://localhost:8880 (admin/<aus .env>)" -ForegroundColor White
Write-Host ""
Write-Host "  Login: admin / CHANGE_ME_DEV_PASSWORD" -ForegroundColor Cyan
Write-Host ""
Write-Host "Zum Stoppen: Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray
Write-Host "Oder:        .\Stop-All.ps1" -ForegroundColor Gray
Write-Host ""

# Warte auf Benutzer-Eingabe
Write-Host "Druecke Enter zum Beenden der Jobs..." -ForegroundColor Yellow
Read-Host

# Jobs beenden
Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
Write-Host "Jobs beendet." -ForegroundColor Green
