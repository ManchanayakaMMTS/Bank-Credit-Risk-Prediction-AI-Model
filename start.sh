#!/bin/bash

echo "🏦 Credit Risk Assessment AI - Unix Startup"
echo "================================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.8 or higher is required"
    echo "Current version: $python_version"
    exit 1
fi

echo "✅ Python $python_version detected"

# Check if requirements are installed
echo "Checking dependencies..."
if ! python3 -c "import flask, pandas, joblib, sklearn" &> /dev/null; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ All dependencies are installed"

# Check if model files exist
if [ ! -f "preprocessor.joblib" ]; then
    echo "❌ Missing preprocessor.joblib file"
    echo "Please ensure this file is in the current directory"
    exit 1
fi

if [ ! -f "final_xgb_model.joblib" ]; then
    echo "❌ Missing final_xgb_model.joblib file"
    echo "Please ensure this file is in the current directory"
    exit 1
fi

echo "✅ All model files found"
echo
echo "🚀 Starting Credit Risk Assessment AI..."
echo "🌐 Server will be available at: http://localhost:5001"
echo "📱 Open index.html in your browser to use the frontend"
echo
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo

# Start the Flask application
python3 app.py
