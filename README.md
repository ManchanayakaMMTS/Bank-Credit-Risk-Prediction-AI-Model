# 🏦 Credit Risk Assessment AI Application

A comprehensive web application that uses machine learning to assess credit risk for loan applications. Built with Python Flask backend, XGBoost model, and modern web frontend.

## 🚀 Features

- **AI-Powered Risk Assessment**: Uses trained XGBoost model for accurate credit risk prediction
- **Real-time Predictions**: Instant loan approval/rejection recommendations
- **Professional Web Interface**: Modern, responsive design with intuitive user experience
- **RESTful API**: Clean API endpoints for integration with other systems
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🏗️ Architecture

```
├── Backend (Flask API)
│   ├── Model serving
│   ├── Data preprocessing
│   └── REST endpoints
├── Frontend (HTML/CSS/JS)
│   ├── Loan application form
│   ├── Real-time validation
│   └── Results display
└── Machine Learning
    ├── XGBoost classifier
    ├── Feature engineering
    └── Risk scoring
```

## 🛠️ Technology Stack

- **Backend**: Python 3.11+, Flask, scikit-learn, XGBoost
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **ML**: XGBoost 3.0.4, scikit-learn 1.6.1, numpy 2.0.2
- **Deployment**: Multi-platform startup scripts

## 📋 Prerequisites

- Python 3.11 or higher
- pip package manager
- Modern web browser
- 4GB+ RAM (for model loading)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/credit-risk-ai.git
cd credit-risk-ai
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Add Your Model Files
Place your trained model files under the `model/` directory:
- `model/preprocessor.joblib` - Data preprocessing pipeline
- `model/final_xgb_model.joblib` - Trained XGBoost model

### 4. Start the Application

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
./start.sh
```

**Manual Start:**
```bash
python app.py
```

### 5. Access the Application
- **Web Interface**: Open `index.html` in your browser
- **API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 📊 Model Features

The application expects the following input features:

### Numerical Features
- `person_age`: Applicant's age
- `person_income`: Annual income
- `person_emp_length`: Employment length in years
- `loan_amnt`: Requested loan amount
- `loan_int_rate`: Interest rate
- `loan_percent_income`: Loan amount as percentage of income
- `cb_person_cred_hist_length`: Credit history length

### Categorical Features
- `person_home_ownership`: Home ownership status
- `loan_intent`: Purpose of the loan
- `loan_grade`: Loan grade (A-G)
- `cb_person_default_on_file`: Previous default history

## 🔌 API Endpoints

### Health Check
```http
GET /health
```
Returns application status and model loading status.

### Prediction
```http
POST /predict
Content-Type: application/json

{
  "person_age": 35,
  "person_income": 75000,
  "person_emp_length": 5.2,
  "loan_amnt": 25000,
  "loan_int_rate": 8.5,
  "loan_percent_income": 25.0,
  "cb_person_cred_hist_length": 12.5,
  "person_home_ownership": "RENT",
  "loan_intent": "DEBTCONSOLIDATION",
  "loan_grade": "B",
  "cb_person_default_on_file": "N"
}
```

**Response:**
```json
{
  "prediction": 1,
  "probability": 0.9936,
  "risk_level": "High Risk",
  "message": "High Risk: This loan application has a 99.36% probability of default. Not recommended for approval."
}
```

## 🎯 Usage Examples

### Example 1: Low-Risk Applicant
- **Age**: 30, **Income**: $100,000, **Employment**: 8 years
- **Loan**: $1,000, **Grade**: A, **Home**: OWN
- **Result**: Low Risk (0.02% default probability)

### Example 2: High-Risk Applicant
- **Age**: 35, **Income**: $75,000, **Employment**: 5 years
- **Loan**: $25,000, **Grade**: B, **Home**: RENT
- **Result**: High Risk (99.36% default probability)

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5001)
- `DEBUG`: Debug mode (default: True)
- `HOST`: Host address (default: 0.0.0.0)

### Model Configuration
The application automatically detects and loads:
- Preprocessing pipeline from `preprocessor.joblib`
- XGBoost model from `final_xgb_model.joblib`

## 🧪 Testing

### API Testing
```bash
# Health check
curl http://localhost:5001/health

# Prediction test
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"person_age": 30, "person_income": 100000, ...}'
```

### Frontend Testing
1. Open `index.html` in your browser
2. Fill out the loan application form
3. Submit and review the prediction results

## 📁 Project Structure

```
credit-risk-ai/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── index.html            # Main web interface
├── style.css             # Styling
├── main.js               # Frontend logic
├── start.py              # Python startup script
├── start.sh              # Unix/macOS startup script
├── start.bat             # Windows startup script
├── inspect_model.py      # Model inspection utility
├── .gitignore            # Git ignore rules
└── README.md             # This file
```


