# 🏦 Credit Risk Assessment AI

A comprehensive web application that demonstrates a machine learning model for credit risk assessment and loan default prediction. This project showcases an end-to-end AI solution with a Flask backend API and a modern, responsive frontend interface.

## 🎯 Project Overview

This application serves as a working demo of a credit risk assessment model that can:
- Analyze loan applicant data
- Predict the likelihood of loan default
- Provide risk assessment recommendations
- Display results in an intuitive, professional interface

## 🏗️ Architecture

The application consists of two main components:

### Backend (Flask API)
- **File**: `app.py`
- **Purpose**: Serves the trained machine learning model via REST API
- **Features**: Model loading, data preprocessing, prediction serving
- **Endpoints**: `/predict`, `/health`, `/`

### Frontend (Web Interface)
- **Files**: `index.html`, `style.css`, `main.js`
- **Purpose**: User interface for data input and result visualization
- **Features**: Form validation, real-time API communication, responsive design

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Modern web browser
- Access to the trained model files:
  - `preprocessor.joblib`
  - `final_xgb_model.joblib`

### Installation

1. **Clone or download the project files**
   ```bash
   # Navigate to your project directory
   cd "Bank Credit AI project"
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Place model files in the project directory**
   - Ensure `preprocessor.joblib` and `final_xgb_model.joblib` are in the same folder as `app.py`

### Running the Application

1. **Start the Flask backend**
   ```bash
   python app.py
   ```
   
   You should see output similar to:
   ```
   Starting Credit Risk Assessment API...
   All models loaded successfully. Starting Flask server...
   * Running on http://0.0.0.0:5000
   ```

2. **Open the frontend**
   - Open `index.html` in your web browser
   - Or navigate to `http://localhost:5000` if you want to test the API directly

3. **Verify API connection**
   - The frontend will automatically check if the API is running
   - A green "API Connected" indicator should appear in the header

## 📊 Using the Application

### Input Form

The application collects comprehensive loan applicant information:

#### Personal Information
- **Age**: Applicant's age (18-100)
- **Annual Income**: Total yearly income in dollars
- **Employment Length**: Years of employment experience
- **Education Level**: Highest education completed

#### Loan Details
- **Loan Amount**: Requested loan amount in dollars
- **Loan Term**: Repayment period in months (12, 24, 36, 48, 60)
- **Interest Rate**: Annual interest rate percentage
- **Loan Purpose**: Reason for the loan (Debt Consolidation, Home Improvement, etc.)

#### Credit Information
- **Credit Score**: FICO or similar credit score (300-850)
- **Credit History Length**: Years of credit history
- **Debt-to-Income Ratio**: Monthly debt payments as percentage of income
- **Number of Credit Accounts**: Total open credit accounts

#### Additional Information
- **Home Ownership**: Current housing situation
- **Income Verification Status**: Whether income has been verified

### Getting Predictions

1. **Fill out the form** with applicant information
2. **Click "Assess Credit Risk"** to submit
3. **View results** including:
   - Risk level (Low Risk/High Risk)
   - Default probability percentage
   - Recommendation message
   - Visual probability bar

### Understanding Results

- **Low Risk (Green)**: Default probability < 30%, recommended for approval
- **Medium Risk (Orange)**: Default probability 30-70%, requires review
- **High Risk (Red)**: Default probability > 70%, not recommended

## 🔧 API Endpoints

### GET `/`
Returns API information and available endpoints.

### GET `/health`
Health check endpoint that verifies model loading status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "preprocessor_loaded": true
}
```

### POST `/predict`
Main prediction endpoint for credit risk assessment.

**Request Body:**
```json
{
  "age": 35,
  "income": 75000,
  "employment_length": 5.2,
  "education": "Bachelor's",
  "loan_amount": 25000,
  "loan_term": 36,
  "interest_rate": 8.5,
  "loan_purpose": "Debt Consolidation",
  "credit_score": 720,
  "credit_history_length": 12.5,
  "debt_to_income": 25.0,
  "number_of_accounts": 8,
  "home_ownership": "Rent",
  "verification_status": "Verified"
}
```

**Response:**
```json
{
  "prediction": 0,
  "probability": 0.15,
  "message": "Low Risk: This loan application has a 15% probability of default. Recommended for approval.",
  "risk_level": "Low Risk"
}
```

## 🛠️ Development

### Project Structure
```
Bank Credit AI project/
├── app.py                 # Flask backend API
├── requirements.txt       # Python dependencies
├── index.html            # Frontend HTML
├── style.css             # Frontend styling
├── main.js               # Frontend JavaScript
├── README.md             # This file
├── preprocessor.joblib   # Trained data preprocessor
└── final_xgb_model.joblib # Trained XGBoost model
```

### Key Features

#### Backend
- **Model Loading**: Automatic loading of preprocessor and model files
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration
- **Data Validation**: Input validation and preprocessing error handling

#### Frontend
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Validation**: Form validation with immediate feedback
- **Error Handling**: User-friendly error messages and notifications
- **API Status**: Visual indicator of backend connection status
- **Smooth Animations**: Professional UI transitions and effects

### Customization

#### Adding New Features
- **New Form Fields**: Add to `formFields` object in `main.js` and update HTML
- **Additional Validation**: Extend `validateForm()` function in `main.js`
- **New API Endpoints**: Add routes in `app.py`

#### Styling Changes
- **Colors**: Modify CSS custom properties in `style.css`
- **Layout**: Adjust grid and flexbox properties
- **Animations**: Customize keyframes and transitions

## 🐛 Troubleshooting

### Common Issues

#### "Models not loaded" Error
- Ensure `preprocessor.joblib` and `final_xgb_model.joblib` are in the project directory
- Check file permissions and paths
- Verify the model files are compatible with the current scikit-learn version

#### API Connection Failed
- Ensure Flask backend is running (`python app.py`)
- Check if port 5000 is available
- Verify firewall settings allow local connections

#### Form Validation Errors
- Check browser console for JavaScript errors
- Ensure all required fields are filled
- Verify numeric values are within specified ranges

#### Styling Issues
- Clear browser cache
- Check if CSS file is properly linked
- Verify browser compatibility

### Debug Mode

The Flask backend runs in debug mode by default, providing detailed error messages and automatic reloading during development.

## 📱 Browser Compatibility

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## 🔒 Security Considerations

- This is a demo application and should not be used in production without proper security measures
- Consider implementing:
  - Input sanitization
  - Rate limiting
  - Authentication/authorization
  - HTTPS encryption
  - API key management

## 📈 Performance

- **Model Loading**: ~1-2 seconds on startup
- **Prediction Time**: ~100-500ms per request
- **Frontend Load**: ~2-3 seconds initial load
- **API Response**: < 1 second for most requests

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and demonstration purposes. Please ensure you have the right to use any included model files or data.

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Verify all dependencies are correctly installed
4. Ensure model files are properly placed

## 🎉 Success!

Once everything is running, you should see:
- A beautiful, professional web interface
- Real-time API connection status
- Smooth form interactions and validation
- Instant credit risk predictions
- Professional result visualization

Congratulations! You now have a fully functional credit risk assessment AI application! 🚀
