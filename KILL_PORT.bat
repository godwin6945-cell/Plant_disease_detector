@echo off
echo Killing processes on port 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Killing PID: %%a
    taskkill /PID %%a /F
)
echo Done!
pause
