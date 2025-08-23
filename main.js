// DOM elements
const creditForm = document.getElementById('creditForm');
const predictBtn = document.getElementById('predictBtn');
const resultsContainer = document.getElementById('results');
const newAssessmentBtn = document.getElementById('newAssessmentBtn');

// API status elements
const apiStatus = document.getElementById('apiStatus');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// Results elements
const riskLevel = document.getElementById('riskLevel');
const probabilityFill = document.getElementById('probabilityFill');
const probabilityText = document.getElementById('probabilityText');
const resultMessage = document.getElementById('resultMessage');
const predictionValue = document.getElementById('predictionValue');
const probabilityValue = document.getElementById('probabilityValue');

// Configuration
const API_BASE_URL = 'http://localhost:5001';

// Form field mappings
const formFields = {
    person_age: { type: 'number', min: 18, max: 100 },
    person_income: { type: 'number', min: 1000, max: 1000000 },
    person_emp_length: { type: 'number', min: 0, max: 50, step: 0.1 },
    loan_amnt: { type: 'number', min: 100, max: 1000000 },
    loan_int_rate: { type: 'number', min: 1, max: 30, step: 0.1 },
    loan_percent_income: { type: 'number', min: 0.1, max: 100, step: 0.1 },
    cb_person_cred_hist_length: { type: 'number', min: 0, max: 50, step: 0.1 },
    person_home_ownership: { type: 'select', options: ['RENT', 'OWN', 'MORTGAGE', 'OTHER'] },
    loan_intent: { type: 'select', options: ['DEBTCONSOLIDATION', 'EDUCATION', 'HOMEIMPROVEMENT', 'MEDICAL', 'PERSONAL', 'VENTURE'] },
    loan_grade: { type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
    cb_person_default_on_file: { type: 'select', options: ['N', 'Y'] }
};

// Numeric validations
const numericValidations = [
    'person_age', 'person_income', 'person_emp_length', 'loan_amnt', 
    'loan_int_rate', 'loan_percent_income', 'cb_person_cred_hist_length'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkApiStatus();
    setupEventListeners();
    setupFormValidation();
});

// Setup event listeners
function setupEventListeners() {
    creditForm.addEventListener('submit', handleFormSubmit);
    newAssessmentBtn.addEventListener('click', resetForm);
    
    // Real-time validation
    Object.keys(formFields).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('input', () => validateField(fieldName));
            field.addEventListener('blur', () => validateField(fieldName));
        }
    });
}

// Setup form validation
function setupFormValidation() {
    // Add validation attributes to inputs
    Object.keys(formFields).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && formFields[fieldName].type === 'number') {
            field.min = formFields[fieldName].min;
            field.max = formFields[fieldName].max;
            if (formFields[fieldName].step) {
                field.step = formFields[fieldName].step;
            }
        }
    });
}

// Check API connection status
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'healthy' && data.model_loaded && data.preprocessor_loaded) {
                setApiStatus('connected', 'API Connected - Model Ready');
            } else {
                setApiStatus('error', 'API Connected - Model Not Ready');
            }
        } else {
            setApiStatus('error', 'API Error');
        }
    } catch (error) {
        setApiStatus('error', 'API Disconnected');
    }
}

// Set API status
function setApiStatus(status, text) {
    statusIndicator.className = `status-indicator ${status}`;
    statusText.textContent = text;
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    predictBtn.disabled = true;
    predictBtn.textContent = 'Processing...';
    
    try {
        const formData = getFormData();
        const result = await submitPrediction(formData);
        displayResults(result);
    } catch (error) {
        showError('Prediction failed: ' + error.message);
    } finally {
        // Reset button state
        predictBtn.disabled = false;
        predictBtn.textContent = '🚀 Assess Credit Risk';
    }
}

// Get form data
function getFormData() {
    const formData = {};
    Object.keys(formFields).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            let value = field.value;
            
            // Convert numeric fields
            if (formFields[fieldName].type === 'number') {
                value = parseFloat(value);
            }
            
            formData[fieldName] = value;
        }
    });
    return formData;
}

// Submit prediction to API
async function submitPrediction(data) {
    const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction request failed');
    }
    
    return await response.json();
}

// Display results
function displayResults(result) {
    // Set risk level
    const riskClass = result.probability < 0.3 ? 'low-risk' : 
                     result.probability < 0.7 ? 'medium-risk' : 'high-risk';
    
    riskLevel.textContent = result.risk_level;
    riskLevel.className = `risk-level ${riskClass}`;
    
    // Set probability bar
    const percentage = (result.probability * 100).toFixed(1);
    probabilityFill.style.width = `${percentage}%`;
    probabilityText.textContent = `${percentage}% Default Probability`;
    
    // Set result message
    resultMessage.textContent = result.message;
    
    // Set detail values
    predictionValue.textContent = result.prediction === 1 ? 'Default Risk' : 'Low Risk';
    probabilityValue.textContent = `${percentage}%`;
    
    // Show results
    resultsContainer.style.display = 'block';
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Validate form
function validateForm() {
    let isValid = true;
    
    Object.keys(formFields).forEach(fieldName => {
        if (!validateField(fieldName)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate individual field
function validateField(fieldName) {
    const field = document.getElementById(fieldName);
    if (!field) return true;
    
    const fieldConfig = formFields[fieldName];
    let isValid = true;
    let errorMessage = '';
    
    // Check if field is empty
    if (!field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Validate numeric fields
    if (fieldConfig.type === 'number' && field.value) {
        const value = parseFloat(field.value);
        if (isNaN(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid number';
        } else if (value < fieldConfig.min || value > fieldConfig.max) {
            isValid = false;
            errorMessage = `Value must be between ${fieldConfig.min} and ${fieldConfig.max}`;
        }
    }
    
    // Update field validation state
    updateFieldValidation(field, isValid, errorMessage);
    
    return isValid;
}

// Update field validation state
function updateFieldValidation(field, isValid, errorMessage) {
    // Remove existing error styling
    field.classList.remove('error', 'success');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    if (!isValid) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        errorDiv.style.color = '#f56565';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '4px';
        field.parentNode.appendChild(errorDiv);
    } else if (field.value.trim()) {
        field.classList.add('success');
    }
}

// Reset form
function resetForm() {
    creditForm.reset();
    
    // Clear validation states
    Object.keys(formFields).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.classList.remove('error', 'success');
            const errorMessage = field.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
    
    // Hide results
    resultsContainer.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show error message
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f56565;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
