# 📁 Setup-Vorlagen

> **Diese Dateien sind Vorlagen für sensible Konfigurationsdateien, die nicht im Git-Repository gespeichert werden.**

## Verwendung

Nach dem Klonen des Repositories müssen diese Dateien an die richtigen Stellen kopiert und angepasst werden:

### 1. `.env` Datei

```powershell
# Kopieren
Copy-Item "setup-vorlagen/.env.example" ".env"

# Dann in .env die Werte anpassen (falls nötig)
```

### 2. PostgreSQL Passwort

```powershell
# Kopieren
Copy-Item "setup-vorlagen/db_password.txt.example" ".extras/compose/postgres/db_password.txt"
```

### 3. TLS-Zertifikate (falls key.pem fehlt)

```powershell
# Kopieren
Copy-Item "setup-vorlagen/key.pem.example" "src/config/resources/tls/key.pem"

# ODER: Neues Zertifikat generieren (empfohlen)
cd src/config/resources/tls
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out certificate.crt -days 365 -nodes -subj "/CN=localhost"
```

---

## Automatisches Setup (PowerShell)

Führe dieses Script aus, um alle Dateien auf einmal zu kopieren:

```powershell
# Im Projektverzeichnis ausführen
.\setup-vorlagen\copy-to-project.ps1
```

---

## Dateien in diesem Ordner

| Datei                     | Ziel                                       | Beschreibung                      |
| ------------------------- | ------------------------------------------ | --------------------------------- |
| `.env.example`            | `.env` (Projekt-Root)                      | Umgebungsvariablen                |
| `db_password.txt.example` | `.extras/compose/postgres/db_password.txt` | PostgreSQL Passwort               |
| `key.pem.example`         | `src/config/resources/tls/key.pem`         | TLS Private Key (selbst-signiert) |
| `copy-to-project.ps1`     | -                                          | Automatisches Kopier-Script       |
| `Setup-Keycloak.ps1`      | -                                          | Keycloak Ersteinrichtung          |
| `keycloak/nest-realm.json`| Keycloak Volume                            | Realm "nest" Konfiguration        |
| `keycloak/nest-users-0.json`| Keycloak Volume                          | Benutzer (admin, user)            |

---

## 🔐 Keycloak Ersteinrichtung

Beim ersten Setup wird Keycloak automatisch mit dem Realm "nest" und den Benutzern eingerichtet.

Falls du Keycloak manuell einrichten musst:

```powershell
.\setup-vorlagen\Setup-Keycloak.ps1
```

---

## ⚠️ Wichtig

- Die `.example` Dateien enthalten **Standard-Entwicklungswerte**
- Für Produktion **MÜSSEN** die Werte geändert werden!
- Die kopierten Dateien (ohne `.example`) sind in `.gitignore` und werden nicht committed
