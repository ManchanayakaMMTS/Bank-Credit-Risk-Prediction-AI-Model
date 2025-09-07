#!/usr/bin/env python3
import joblib
import pandas as pd
import os

try:
    # Resolve model directory relative to this file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(base_dir, 'model')

    # Load the preprocessor
    print("Loading preprocessor...")
    preprocessor = joblib.load(os.path.join(model_dir, 'preprocessor.joblib'))
    print("✅ Preprocessor loaded successfully")
    
    # Load the model
    print("Loading XGBoost model...")
    model = joblib.load(os.path.join(model_dir, 'final_xgb_model.joblib'))
    print("✅ XGBoost model loaded successfully")
    
    # Check preprocessor structure
    print("\n🔍 PREPROCESSOR ANALYSIS:")
    if hasattr(preprocessor, 'steps'):
        for i, (name, step) in enumerate(preprocessor.steps):
            print(f"Step {i+1}: {name} - {type(step).__name__}")
            if hasattr(step, 'categories_'):
                print(f"  Categories: {step.categories_}")
            if hasattr(step, 'feature_names_in_'):
                print(f"  Feature names: {step.feature_names_in_}")
    
    # Check model attributes
    print("\n🔍 MODEL ANALYSIS:")
    print(f"Model type: {type(model).__name__}")
    if hasattr(model, 'feature_names_in_'):
        print(f"Feature names: {model.feature_names_in_}")
    if hasattr(model, 'use_label_encoder'):
        print(f"Has use_label_encoder: {hasattr(model, 'use_label_encoder')}")
    
    # Try to get feature names from preprocessor
    if hasattr(preprocessor, 'get_feature_names_out'):
        try:
            feature_names = preprocessor.get_feature_names_out()
            print(f"\n📋 EXPECTED FEATURES ({len(feature_names)}):")
            for i, name in enumerate(feature_names):
                print(f"  {i+1:2d}. {name}")
        except Exception as e:
            print(f"Could not get feature names: {e}")
    
    # Check what the preprocessor expects as input
    print("\n🔍 INPUT EXPECTATIONS:")
    if hasattr(preprocessor, 'steps'):
        for name, step in preprocessor.steps:
            if hasattr(step, 'feature_names_in_'):
                print(f"{name} expects: {step.feature_names_in_}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
