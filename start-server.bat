@echo off
title Kelurahan Matani Satu - Local Server
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8000
  node server.js 8000
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  echo Node.js tidak ditemukan, memakai Python...
  start "" http://localhost:8000
  python -m http.server 8000
  goto :eof
)
echo Node.js atau Python belum terpasang.
echo Unduh Node.js di https://nodejs.org lalu jalankan file ini lagi.
pause
