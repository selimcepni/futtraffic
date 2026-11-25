@echo off
setlocal
cd /d "%~dp0"
docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop'i Linux containers modunda baslatip tekrar deneyin.
  pause
  exit /b 1
)
docker compose -f compose.studio.yaml up --build --detach --wait
if errorlevel 1 (
  docker compose -f compose.studio.yaml logs --tail 60 studio
  pause
  exit /b 1
)
docker compose -f compose.studio.yaml logs --tail 15 studio
start "" "http://127.0.0.1:8000/studyo/"
