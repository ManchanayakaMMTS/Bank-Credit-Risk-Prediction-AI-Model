@echo off
echo 🏦 Credit Risk Assessment AI - Windows Startup
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if requirements are installed
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if model files exist
if not exist "preprocessor.joblib" (
    echo ❌ Missing preprocessor.joblib file
    echo Please ensure this file is in the current directory
    pause
    exit /b 1
)

if not exist "final_xgb_model.joblib" (
    echo ❌ Missing final_xgb_model.joblib file
    echo Please ensure this file is in the current directory
    pause
    exit /b 1
)

echo ✅ All checks passed
echo.
echo 🚀 Starting Credit Risk Assessment AI...
echo 🌐 Server will be available at: http://localhost:5001
echo 📱 Open index.html in your browser to use the frontend
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

python app.py

pause
