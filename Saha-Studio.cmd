@echo off
cd /d "%~dp0"
wsl.exe --cd "%CD%" bash saha-baslat.sh
if errorlevel 1 pause
