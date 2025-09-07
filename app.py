from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
import logging
import numpy as np
import xgboost as xgb

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
        # Resolve model directory relative to this file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(base_dir, "model")

        # Load the preprocessor
        preprocessor_path = os.path.join(model_dir, "preprocessor.joblib")
        if os.path.exists(preprocessor_path):
            preprocessor = joblib.load(preprocessor_path)
            logger.info("Preprocessor loaded successfully")
        else:
            logger.error(f"Preprocessor file not found at {preprocessor_path}")
            return False
            
        # Load the XGBoost model
        model_path = os.path.join(model_dir, "final_xgb_model.joblib")
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            logger.info("XGBoost model loaded successfully")
            # Compatibility hotfix for models serialized with older XGBoost
            if not hasattr(model, 'use_label_encoder'):
                try:
                    setattr(model, 'use_label_encoder', False)
                    logger.info("Applied compatibility fix: set model.use_label_encoder = False")
                except Exception:
                    logger.warning("Could not set model.use_label_encoder; proceeding without it")
            # Force CPU prediction to avoid missing GPU attributes
            try:
                if hasattr(model, 'set_params'):
                    model.set_params(**{
                        'predictor': 'cpu_predictor',
                        'tree_method': 'hist',
                        'device': 'cpu',
                        'n_jobs': 1
                    })
                # Ensure attributes exist on the sklearn wrapper
                if not hasattr(model, 'gpu_id'):
                    setattr(model, 'gpu_id', -1)
                if not hasattr(model, 'device'):
                    setattr(model, 'device', 'cpu')
                # Also set params on the underlying Booster if present
                if hasattr(model, 'get_booster'):
                    try:
                        booster = model.get_booster()
                        booster.set_param({'predictor': 'cpu_predictor', 'device': 'cpu'})
                    except Exception:
                        pass
                logger.info("Applied CPU predictor compatibility settings")
            except Exception as e:
                logger.warning(f"Could not enforce CPU predictor settings: {e}")
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
            # Use Booster directly to avoid compatibility issues (gpu_id/use_label_encoder)
            booster = model.get_booster() if hasattr(model, 'get_booster') else None
            if booster is not None:
                dmatrix = xgb.DMatrix(processed_data)
                prob = booster.predict(dmatrix)
                # Handle output shape for binary classification
                if isinstance(prob, (list, tuple)):
                    prob = np.array(prob)
                prob = prob.ravel()[0]
                probability = float(prob)
                prediction = int(1 if probability >= 0.5 else 0)
            else:
                # Fallback to sklearn wrapper
                prediction = model.predict(processed_data)[0]
                probability = float(model.predict_proba(processed_data)[0][1])
            logger.info(f"Prediction: {prediction}, Probability: {probability:.4f}")
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return jsonify({
                'error': f'Prediction failed: {str(e)}'
            }), 500
        
        # Create response message and lightweight rationale
        if prediction == 0:
            message = f"Low Risk: This loan application has a {probability:.2%} probability of default. Recommended for approval."
        else:
            message = f"High Risk: This loan application has a {probability:.2%} probability of default. Not recommended for approval."

        # Simple rule-based rationale based on key drivers (for demo)
        rationale_parts = []
        try:
            loan_percent_income = float(df.get('loan_percent_income', [None])[0])
            if loan_percent_income is not None:
                if loan_percent_income > 0.6:
                    rationale_parts.append("High loan-to-income ratio")
                elif loan_percent_income < 0.2:
                    rationale_parts.append("Low loan-to-income ratio")
            loan_int_rate = float(df.get('loan_int_rate', [None])[0])
            if loan_int_rate is not None:
                if loan_int_rate > 20:
                    rationale_parts.append("Very high interest rate")
                elif loan_int_rate < 8:
                    rationale_parts.append("Favorable interest rate")
            cred_hist = float(df.get('cb_person_cred_hist_length', [None])[0])
            if cred_hist is not None:
                if cred_hist < 2:
                    rationale_parts.append("Short credit history")
                elif cred_hist > 8:
                    rationale_parts.append("Established credit history")
            previous_default = df.get('cb_person_default_on_file', [None])[0]
            if previous_default == 'Y':
                rationale_parts.append("Previous default on file")
            if not rationale_parts:
                rationale_parts.append("Typical risk profile for provided features")
        except Exception:
            rationale_parts = ["Rationale unavailable"]
        rationale = ", ".join(rationale_parts)
        
        # Return prediction results
        response = {
            'prediction': int(prediction),
            'probability': float(probability),
            'message': message,
            'risk_level': 'High Risk' if prediction == 1 else 'Low Risk',
            'rationale': rationale
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
