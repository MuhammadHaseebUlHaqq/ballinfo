@echo off
SETLOCAL

echo === LaLiga News Backend Test Script ===
echo =======================================

REM Check if the server is already running
netstat -ano | findstr :3000 | findstr LISTENING > nul
if %ERRORLEVEL% EQU 0 (
    echo Server already running on port 3000
    SET SERVER_RUNNING=true
) else (
    echo Starting server...
    
    REM Navigate to the server directory
    cd ..\mainServer
    
    REM Start the server in a new window
    start /B cmd /c "node server.js"
    
    SET SERVER_RUNNING=false
    
    REM Wait for server to start
    echo Waiting for server to start...
    timeout /t 5 /nobreak > nul
)

echo =======================================
echo Running tests...

REM Run the test script
node ..\scripts\testNewsApi.js

REM Store the exit code
SET TEST_EXIT_CODE=%ERRORLEVEL%

REM Clean up if we started the server
if "%SERVER_RUNNING%"=="false" (
    echo Stopping server...
    REM Find the PID of the node process running on port 3000
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        echo Stopping process with PID: %%a
        taskkill /F /PID %%a
    )
)

echo =======================================
if %TEST_EXIT_CODE% EQU 0 (
    echo All tests passed!
    exit /b 0
) else (
    echo Tests failed with exit code %TEST_EXIT_CODE%
    exit /b %TEST_EXIT_CODE%
)

ENDLOCAL 