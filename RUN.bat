@echo off
echo ========================================
echo   PoseAI Suite v2.1 - Auto Setup
echo ========================================
echo.

cd /d "c:\Users\godwi\Downloads\pose dectection 2"

echo [1/4] Activating Python environment...
call pose_env\Scripts\activate

echo.
echo [2/4] Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo [3/4] Checking installation...
python -c "import flask; print('Flask:', flask.__version__)"
python -c "import psutil; print('psutil:', psutil.__version__)"

echo.
echo [4/4] Starting server...
echo.
echo ========================================
echo   Server starting on port 5001
echo   Open: http://localhost:5001
echo   Press Ctrl+C to stop
echo ========================================
echo.

python app.py

pause
