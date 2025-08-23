#!/usr/bin/env python3
"""
Startup script for Credit Risk Assessment AI
This script provides an alternative way to start the Flask application
with better error handling and user feedback.
"""

import os
import sys
import subprocess
import time

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import pandas
        import joblib
        import sklearn
        print("✅ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_model_files():
    """Check if model files exist"""
    required_files = ['preprocessor.joblib', 'final_xgb_model.joblib']
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("❌ Missing model files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nPlease ensure these files are in the current directory.")
        return False
    
    print("✅ All model files found")
    return True

def start_flask_app():
    """Start the Flask application"""
    print("\n🚀 Starting Credit Risk Assessment AI...")
    print("=" * 50)
    
    try:
        # Start the Flask app
        from app import app
        
        print("✅ Flask application loaded successfully")
        print("🌐 Server will be available at: http://localhost:5001")
        print("📱 Open index.html in your browser to use the frontend")
        print("\nPress Ctrl+C to stop the server")
        print("=" * 50)
        
        # Run the app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        print(f"❌ Failed to start Flask application: {e}")
        return False
    
    return True

def main():
    """Main startup function"""
    print("🏦 Credit Risk Assessment AI - Startup Script")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check model files
    if not check_model_files():
        sys.exit(1)
    
    # Start the application
    try:
        start_flask_app()
    except KeyboardInterrupt:
        print("\n\n👋 Application stopped by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
