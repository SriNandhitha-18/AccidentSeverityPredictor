"""
Train the Random Forest model for accident severity prediction.
Run standalone: python train_model.py
Or called from app.py for retraining.
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "encoder.pkl")

# Feature definitions
CATEGORICAL_FEATURES = [
    "weather", "road_condition", "vehicle_type",
    "traffic_density", "time_of_day", "light_condition"
]
NUMERICAL_FEATURES = ["speed", "driver_age", "alcohol_involvement"]
TARGET = "severity"


def generate_synthetic_data(n_samples=50000):
    """Generate realistic synthetic accident data for training."""
    np.random.seed(42)
    
    weather_options = ["sunny", "rainy", "foggy", "storm"]
    road_options = ["dry", "wet", "damaged"]
    vehicle_options = ["car", "bike", "truck", "bus"]
    traffic_options = ["low", "medium", "high"]
    time_options = ["morning", "afternoon", "evening", "night"]
    light_options = ["day", "night"]
    
    data = {
        "weather": np.random.choice(weather_options, n_samples, p=[0.4, 0.3, 0.15, 0.15]),
        "road_condition": np.random.choice(road_options, n_samples, p=[0.5, 0.35, 0.15]),
        "vehicle_type": np.random.choice(vehicle_options, n_samples, p=[0.4, 0.2, 0.25, 0.15]),
        "traffic_density": np.random.choice(traffic_options, n_samples, p=[0.3, 0.4, 0.3]),
        "time_of_day": np.random.choice(time_options, n_samples, p=[0.25, 0.3, 0.2, 0.25]),
        "light_condition": np.random.choice(light_options, n_samples, p=[0.6, 0.4]),
        "speed": np.clip(np.random.normal(70, 30, n_samples), 10, 200).astype(int),
        "driver_age": np.clip(np.random.normal(38, 15, n_samples), 16, 85).astype(int),
        "alcohol_involvement": np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),
    }
    
    df = pd.DataFrame(data)
    
    # Generate severity based on realistic correlations
    severity_score = np.zeros(n_samples, dtype=float)
    
    # Weather impact
    weather_map = {"sunny": 0, "rainy": 0.25, "foggy": 0.35, "storm": 0.5}
    severity_score += df["weather"].map(weather_map).values
    
    # Road condition impact
    road_map = {"dry": 0, "wet": 0.2, "damaged": 0.4}
    severity_score += df["road_condition"].map(road_map).values
    
    # Speed impact (normalized)
    severity_score += np.clip((df["speed"].values - 40) / 120, 0, 1) * 0.5
    
    # Vehicle vulnerability
    vehicle_map = {"car": 0.1, "bike": 0.35, "truck": 0.2, "bus": 0.15}
    severity_score += df["vehicle_type"].map(vehicle_map).values
    
    # Age risk (young and old drivers)
    age_risk = np.where(df["driver_age"] < 25, 0.2, np.where(df["driver_age"] > 65, 0.25, 0))
    severity_score += age_risk
    
    # Traffic
    traffic_map = {"low": 0, "medium": 0.15, "high": 0.3}
    severity_score += df["traffic_density"].map(traffic_map).values
    
    # Time of day
    time_map = {"morning": 0.05, "afternoon": 0, "evening": 0.15, "night": 0.3}
    severity_score += df["time_of_day"].map(time_map).values
    
    # Light condition
    light_map = {"day": 0, "night": 0.25}
    severity_score += df["light_condition"].map(light_map).values
    
    # Alcohol
    severity_score += df["alcohol_involvement"].values * 0.4
    
    # Add noise
    severity_score += np.random.normal(0, 0.1, n_samples)
    
    # Normalize to 0-1
    severity_score = np.clip(severity_score / 2.2, 0, 1)
    
    # Convert to severity classes
    df["severity"] = pd.cut(
        severity_score,
        bins=[-0.01, 0.25, 0.5, 0.75, 1.01],
        labels=[0, 1, 2, 3]
    ).astype(int)
    
    return df


def train_and_save(df=None):
    """Train Random Forest model and save to disk."""
    if df is None:
        print("Generating synthetic training data (50,000 samples)...")
        df = generate_synthetic_data()
    
    print(f"Training on {len(df)} samples...")
    print(f"Severity distribution:\n{df['severity'].value_counts().sort_index()}\n")
    
    X = df[CATEGORICAL_FEATURES + NUMERICAL_FEATURES]
    y = df[TARGET]
    
    # Create preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
            ("num", StandardScaler(), NUMERICAL_FEATURES),
        ]
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Fit preprocessor on training data
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Train Random Forest
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_processed, y_train)
    
    # Evaluate
    y_pred = rf_model.predict(X_test_processed)
    accuracy = accuracy_score(y_test, y_pred)
    
    # Cross-validation
    cv_scores = cross_val_score(rf_model, X_train_processed, y_train, cv=5)
    
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred, target_names=['Low', 'Medium', 'High', 'Fatal'])}")
    
    # Save model, scaler, and encoder
    joblib.dump(rf_model, MODEL_PATH)
    joblib.dump(preprocessor, ENCODER_PATH)
    # Save a dummy scaler for backward compat
    joblib.dump(StandardScaler(), SCALER_PATH)
    
    print(f"\nModel saved to {MODEL_PATH}")
    print(f"Preprocessor saved to {ENCODER_PATH}")
    
    metrics = {
        "accuracy": round(accuracy, 4),
        "cv_mean": round(cv_scores.mean(), 4),
        "cv_std": round(cv_scores.std(), 4),
        "n_train": len(X_train),
        "n_test": len(X_test),
        "n_features": X_train_processed.shape[1]
    }
    
    return metrics


def train_from_csv(filepath):
    """Train model from an uploaded CSV file."""
    df = pd.read_csv(filepath)
    
    # Validate required columns
    required = CATEGORICAL_FEATURES + NUMERICAL_FEATURES + [TARGET]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {', '.join(missing)}")
    
    # Clean data
    df = df.dropna()
    df["severity"] = df["severity"].astype(int)
    
    return train_and_save(df)


if __name__ == "__main__":
    print("=" * 60)
    print("  Accident Severity Prediction - Model Training")
    print("=" * 60)
    metrics = train_and_save()
    print(f"\nFinal metrics: {metrics}")
