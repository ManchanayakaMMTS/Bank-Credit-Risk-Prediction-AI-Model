// DOM elements
const predictionForm = document.getElementById('predictionForm');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('resultsContainer');
const resultCard = document.getElementById('resultCard');
const riskIndicator = document.getElementById('riskIndicator');
const riskIcon = document.getElementById('riskIcon');
const riskText = document.getElementById('riskText');
const probabilityFill = document.getElementById('probabilityFill');
const probabilityValue = document.getElementById('probabilityValue');
const recommendation = document.getElementById('recommendation');

// API configuration
const API_BASE_URL = 'http://localhost:5001';
const API_ENDPOINTS = {
    predict: '/predict',
    health: '/health'
};

// Form field mappings
const formFields = {
    person_age: 'person_age',
    person_income: 'person_income',
    person_emp_length: 'person_emp_length',
    education: 'education',
    loan_amnt: 'loan_amnt',
    loan_term: 'loan_term',
    loan_int_rate: 'loan_int_rate',
    loan_intent: 'loan_intent',
    credit_score: 'credit_score',
    cb_person_cred_hist_length: 'cb_person_cred_hist_length',
    loan_percent_income: 'loan_percent_income',
    number_of_accounts: 'number_of_accounts',
    person_home_ownership: 'person_home_ownership',
    verification_status: 'verification_status',
    loan_grade: 'loan_grade',
    cb_person_default_on_file: 'cb_person_default_on_file'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add event listeners
    predictionForm.addEventListener('submit', handleFormSubmit);
    clearBtn.addEventListener('click', clearForm);
    
    // Check API health on load
    checkAPIHealth();
    
    // Add form validation
    addFormValidation();
}

// Check if the API is running
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.health}`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            console.log('API is healthy and ready');
            updateAPIStatus(true);
        } else {
            console.warn('API health check failed');
            updateAPIStatus(false);
        }
    } catch (error) {
        console.error('API health check failed:', error);
        updateAPIStatus(false);
    }
}

// Update API status indicator
function updateAPIStatus(isHealthy) {
    const statusIndicator = document.createElement('div');
    statusIndicator.className = `api-status ${isHealthy ? 'healthy' : 'unhealthy'}`;
    statusIndicator.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">${isHealthy ? 'API Connected' : 'API Disconnected'}</span>
    `;
    
    // Remove existing status indicator
    const existingStatus = document.querySelector('.api-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Add to header
    const header = document.querySelector('.header');
    header.appendChild(statusIndicator);
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Collect form data
        const formData = collectFormData();
        
        // Send prediction request
        const prediction = await sendPredictionRequest(formData);
        
        // Display results
        displayResults(prediction);
        
        // Show results container
        resultsContainer.style.display = 'block';
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Prediction failed:', error);
        showError('Failed to get prediction. Please try again.');
    } finally {
        // Hide loading state
        setLoadingState(false);
    }
}

// Collect form data
function collectFormData() {
    const data = {};
    
    Object.entries(formFields).forEach(([key, fieldName]) => {
        const element = document.getElementById(fieldName);
        if (element) {
            let value = element.value;
            
            // Convert numeric fields
            if (['person_age', 'person_income', 'person_emp_length', 'loan_amnt', 'loan_term', 
                 'loan_int_rate', 'credit_score', 'cb_person_cred_hist_length', 
                 'loan_percent_income', 'number_of_accounts'].includes(fieldName)) {
                value = parseFloat(value) || 0;
            }
            
            data[fieldName] = value;
        }
    });
    
    return data;
}

// Send prediction request to API
async function sendPredictionRequest(data) {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.predict}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Display prediction results
function displayResults(prediction) {
    const { prediction: riskClass, probability, message, risk_level } = prediction;
    
    // Update risk indicator
    updateRiskIndicator(riskClass, risk_level);
    
    // Update probability display
    updateProbabilityDisplay(probability);
    
    // Update recommendation
    updateRecommendation(message, riskClass);
}

// Update risk indicator
function updateRiskIndicator(riskClass, riskLevel) {
    const isHighRisk = riskClass === 1;
    
    // Update icon
    riskIcon.innerHTML = isHighRisk ? '⚠️' : '✅';
    
    // Update text
    riskText.textContent = riskLevel;
    
    // Update styling
    riskIndicator.className = `risk-indicator ${isHighRisk ? 'risk-high' : 'risk-low'}`;
}

// Update probability display
function updateProbabilityDisplay(probability) {
    const percentage = (probability * 100).toFixed(1);
    
    // Update probability value
    probabilityValue.textContent = `${percentage}%`;
    
    // Update probability bar
    probabilityFill.style.width = `${percentage}%`;
    
    // Update bar color based on risk level
    if (probability < 0.3) {
        probabilityFill.style.background = 'linear-gradient(90deg, #48bb78 0%, #38a169 100%)';
    } else if (probability < 0.7) {
        probabilityFill.style.background = 'linear-gradient(90deg, #ed8936 0%, #dd6b20 100%)';
    } else {
        probabilityFill.style.background = 'linear-gradient(90deg, #f56565 0%, #e53e3e 100%)';
    }
}

// Update recommendation
function updateRecommendation(message, riskClass) {
    recommendation.textContent = message;
    recommendation.className = `recommendation ${riskClass === 0 ? 'recommendation-approve' : 'recommendation-reject'}`;
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Clear form
function clearForm() {
    predictionForm.reset();
    
    // Hide results
    resultsContainer.style.display = 'none';
    
    // Clear any error states
    clearFormErrors();
    
    // Focus on first field
    const firstField = document.querySelector('input, select');
    if (firstField) {
        firstField.focus();
    }
}

// Form validation
function validateForm() {
    clearFormErrors();
    
    let isValid = true;
    
    // Check required fields
    Object.values(formFields).forEach(fieldName => {
        const element = document.getElementById(fieldName);
        if (element && element.hasAttribute('required') && !element.value.trim()) {
            showFieldError(element, 'This field is required');
            isValid = false;
        }
    });
    
            // Validate numeric ranges
        const numericValidations = [
            { field: 'person_age', min: 18, max: 100 },
            { field: 'person_income', min: 0 },
            { field: 'person_emp_length', min: 0, max: 50 },
            { field: 'loan_amnt', min: 0 },
            { field: 'loan_int_rate', min: 0, max: 30 },
            { field: 'credit_score', min: 300, max: 850 },
            { field: 'loan_percent_income', min: 0, max: 100 }
        ];
    
    numericValidations.forEach(validation => {
        const element = document.getElementById(validation.field);
        if (element && element.value) {
            const value = parseFloat(element.value);
            if (isNaN(value) || (validation.min !== undefined && value < validation.min) || 
                (validation.max !== undefined && value > validation.max)) {
                const message = validation.max !== undefined ? 
                    `Value must be between ${validation.min} and ${validation.max}` :
                    `Value must be at least ${validation.min}`;
                showFieldError(element, message);
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Show field error
function showFieldError(element, message) {
    const formGroup = element.closest('.form-group');
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
}

// Clear form errors
function clearFormErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

// Show general error
function showError(message) {
    // Create error notification
    const errorNotification = document.createElement('div');
    errorNotification.className = 'error-notification';
    errorNotification.innerHTML = `
        <div class="error-content">
            <span class="error-icon">❌</span>
            <span class="error-text">${message}</span>
            <button class="error-close">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(errorNotification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorNotification.parentNode) {
            errorNotification.remove();
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = errorNotification.querySelector('.error-close');
    closeBtn.addEventListener('click', () => {
        errorNotification.remove();
    });
}

// Add form validation
function addFormValidation() {
    // Real-time validation on input
    Object.values(formFields).forEach(fieldName => {
        const element = document.getElementById(fieldName);
        if (element) {
            element.addEventListener('blur', () => {
                validateField(element);
            });
            
            element.addEventListener('input', () => {
                clearFieldError(element);
            });
        }
    });
}

// Validate individual field
function validateField(element) {
    const formGroup = element.closest('.form-group');
    if (!formGroup) return;
    
    // Clear previous error
    clearFieldError(element);
    
    // Check if required
    if (element.hasAttribute('required') && !element.value.trim()) {
        showFieldError(element, 'This field is required');
        return;
    }
    
    // Check numeric ranges
    if (element.type === 'number' && element.value) {
        const value = parseFloat(element.value);
        const min = parseFloat(element.min);
        const max = parseFloat(element.max);
        
        if (isNaN(value)) {
            showFieldError(element, 'Please enter a valid number');
            return;
        }
        
        if (min !== undefined && value < min) {
            showFieldError(element, `Value must be at least ${min}`);
            return;
        }
        
        if (max !== undefined && value > max) {
            showFieldError(element, `Value must be at most ${max}`);
            return;
        }
    }
    
    // Mark as valid
    formGroup.classList.add('success');
}

// Clear field error
function clearFieldError(element) {
    const formGroup = element.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error', 'success');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

// Add CSS for error notification
const errorNotificationCSS = `
    .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff5f5;
        border: 2px solid #feb2b2;
        border-radius: 8px;
        padding: 15px 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }
    
    .error-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .error-icon {
        font-size: 1.2rem;
    }
    
    .error-text {
        color: #742a2a;
        font-weight: 500;
    }
    
    .error-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #742a2a;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }
    
    .error-close:hover {
        background: #fed7d7;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .api-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
        margin-top: 15px;
    }
    
    .api-status.healthy {
        background: rgba(72, 187, 120, 0.2);
        color: #48bb78;
        border: 1px solid rgba(72, 187, 120, 0.3);
    }
    
    .api-status.unhealthy {
        background: rgba(245, 101, 101, 0.2);
        color: #f56565;
        border: 1px solid rgba(245, 101, 101, 0.3);
    }
    
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = errorNotificationCSS;
document.head.appendChild(style);
