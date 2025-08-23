from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Global variables for model and preprocessor
model = None
preprocessor = None

def load_models():
    """Load the trained model and preprocessor"""
    global model, preprocessor
    
    try:
        # Load the preprocessor
        preprocessor_path = "preprocessor.joblib"
        if os.path.exists(preprocessor_path):
            preprocessor = joblib.load(preprocessor_path)
            logger.info("Preprocessor loaded successfully")
        else:
            logger.error(f"Preprocessor file not found at {preprocessor_path}")
            return False
            
        # Load the XGBoost model
        model_path = "final_xgb_model.joblib"
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            logger.info("XGBoost model loaded successfully")
        else:
            logger.error(f"Model file not found at {model_path}")
            return False
            
        return True
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'preprocessor_loaded': preprocessor is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Check if models are loaded
        if model is None or preprocessor is None:
            return jsonify({
                'error': 'Models not loaded. Please ensure model files are available.'
            }), 500
        
        # Get JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Convert to DataFrame
        df = pd.DataFrame([data])
        
        # Log the input data
        logger.info(f"Received prediction request with data: {data}")
        
        # Preprocess the data
        try:
            processed_data = preprocessor.transform(df)
            logger.info("Data preprocessing completed successfully")
        except Exception as e:
            logger.error(f"Preprocessing error: {str(e)}")
            return jsonify({
                'error': f'Data preprocessing failed: {str(e)}'
            }), 400
        
        # Make prediction
        try:
            prediction = model.predict(processed_data)[0]
            probability = model.predict_proba(processed_data)[0][1]  # Probability of class 1 (high risk)
            logger.info(f"Prediction: {prediction}, Probability: {probability:.4f}")
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return jsonify({
                'error': f'Prediction failed: {str(e)}'
            }), 500
        
        # Create response message
        if prediction == 0:
            message = f"Low Risk: This loan application has a {probability:.2%} probability of default. Recommended for approval."
        else:
            message = f"High Risk: This loan application has a {probability:.2%} probability of default. Not recommended for approval."
        
        # Return prediction results
        response = {
            'prediction': int(prediction),
            'probability': float(probability),
            'message': message,
            'risk_level': 'High Risk' if prediction == 1 else 'Low Risk'
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Unexpected error in prediction endpoint: {str(e)}")
        return jsonify({
            'error': f'An unexpected error occurred: {str(e)}'
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'Credit Risk Assessment API',
        'endpoints': {
            'GET /': 'API information',
            'GET /health': 'Health check',
            'POST /predict': 'Make credit risk prediction'
        },
        'usage': 'Send POST request to /predict with loan applicant features'
    })

if __name__ == '__main__':
    # Load models on startup
    logger.info("Starting Credit Risk Assessment API...")
    if load_models():
        logger.info("All models loaded successfully. Starting Flask server...")
        app.run(debug=True, host='0.0.0.0', port=5001)
    else:
        logger.error("Failed to load models. Please check model files and restart.")
        exit(1)
