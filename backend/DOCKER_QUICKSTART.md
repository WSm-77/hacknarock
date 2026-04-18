# Docker Quickstart

This project uses Docker only for PostgreSQL (`postgres` service in `docker-compose.yml`).

## 1. Prerequisites

- Docker Desktop (or Docker Engine) is installed and running.
- Open a terminal in the project directory.

## 2. Create local env file (first run)

### Windows (PowerShell)

```powershell
Set-Location "C:\Studia\hacknarock\backend"
Copy-Item .env.example .env
```

### Linux/macOS (bash/zsh)

```bash
cd /path/to/backend
cp .env.example .env
```

## 3. Start PostgreSQL

### Windows (PowerShell)

```powershell
Set-Location "C:\Studia\hacknarock\backend"
docker compose up -d
```

### Linux/macOS (bash/zsh)

```bash
cd /path/to/backend
docker compose up -d
```

## 4. Check container status

```bash
docker compose ps
```

## 5. View database logs

```bash
docker compose logs -f postgres
```

## 6. Stop PostgreSQL

```bash
docker compose down
```
