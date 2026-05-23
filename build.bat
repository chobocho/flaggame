@echo off
setlocal
cd /d "%~dp0"
call npm run build || exit /b %ERRORLEVEL%
call node scripts\inline.mjs || exit /b %ERRORLEVEL%
endlocal
