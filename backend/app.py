"""
Accident Severity Prediction - Flask REST API
Run: python app.py
Endpoints:
  POST /predict  - Predict accident severity
  POST /train    - Retrain model with uploaded CSV
  GET  /stats    - Get model & prediction stats
  GET  /health   - Health check
"""

import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib

from utils import preprocess_input, generate_recommendations, SEVERITY_LABELS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model & scaler
model = None
scaler = None
encoder = None
prediction_log = []

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "encoder.pkl")


def load_model():
    """Load trained model, scaler, and encoder into memory."""
    global model, scaler, encoder
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            encoder = joblib.load(ENCODER_PATH)
            logger.info("Model loaded successfully")
        else:
            logger.warning("No trained model found. Run train_model.py first.")
            logger.info("Generating synthetic model for demo...")
            from train_model import train_and_save
            train_and_save()
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            encoder = joblib.load(ENCODER_PATH)
            logger.info("Synthetic model trained and loaded")
    except Exception as e:
        logger.error(f"Error loading model: {e}")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict accident severity.
    
    Expected JSON body:
    {
        "weather": "rainy",
        "road_condition": "wet",
        "vehicle_type": "bike",
        "speed": 90,
        "driver_age": 25,
        "traffic_density": "high",
        "time_of_day": "night",
        "light_condition": "night",
        "alcohol_involvement": true
    }
    """
    if model is None:
        return jsonify({"error": "Model not loaded. Train the model first."}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Validate required fields
        required_fields = [
            "weather", "road_condition", "vehicle_type", "speed",
            "driver_age", "traffic_density", "time_of_day",
            "light_condition", "alcohol_involvement"
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        # Validate numeric ranges
        speed = float(data["speed"])
        age = int(data["driver_age"])
        if speed < 0 or speed > 300:
            return jsonify({"error": "Speed must be between 0 and 300"}), 400
        if age < 16 or age > 100:
            return jsonify({"error": "Driver age must be between 16 and 100"}), 400

        # Preprocess and predict
        features = preprocess_input(data, encoder, scaler)
        
        # Get prediction and probabilities
        severity = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0].tolist()
        probability = float(max(probabilities))

        # Identify contributing factors
        factors = []
        if data["weather"] in ["rainy", "foggy", "storm"]:
            factors.append(f"Adverse Weather: {data['weather'].title()}")
        if data["road_condition"] in ["wet", "damaged"]:
            factors.append(f"Road Condition: {data['road_condition'].title()}")
        if speed > 80:
            factors.append(f"High Speed: {int(speed)} km/h")
        if data["vehicle_type"] == "bike":
            factors.append("Vulnerable Vehicle: Bike")
        if age < 25:
            factors.append("Young Driver")
        elif age > 65:
            factors.append("Elderly Driver")
        if data["traffic_density"] == "high":
            factors.append("High Traffic Density")
        if data["time_of_day"] == "night":
            factors.append("Night Conditions")
        if data.get("alcohol_involvement") in [True, "true", "yes", 1]:
            factors.append("Alcohol Involvement")

        if not factors:
            factors = ["Normal conditions"]

        # Generate recommendations
        recommendations = generate_recommendations(severity, factors)

        result = {
            "severity": severity,
            "label": SEVERITY_LABELS[severity],
            "probability": round(probability, 4),
            "confidence": [round(p, 4) for p in probabilities],
            "factors": factors,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }

        # Log prediction
        prediction_log.append({
            "input": data,
            "result": result,
            "timestamp": datetime.now().isoformat()
        })

        logger.info(f"Prediction: severity={severity} ({SEVERITY_LABELS[severity]}), prob={probability:.2%}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/train", methods=["POST"])
def train():
    """
    Retrain model. Optionally accepts CSV file upload.
    If no file provided, retrains with existing/synthetic data.
    """
    try:
        from train_model import train_and_save, train_from_csv
        
        if "file" in request.files:
            file = request.files["file"]
            if file.filename and file.filename.endswith(".csv"):
                filepath = os.path.join(os.path.dirname(__file__), "uploaded_data.csv")
                file.save(filepath)
                metrics = train_from_csv(filepath)
                logger.info(f"Model retrained from uploaded CSV: {metrics}")
            else:
                return jsonify({"error": "Please upload a CSV file"}), 400
        else:
            metrics = train_and_save()
            logger.info(f"Model retrained with synthetic data: {metrics}")

        # Reload model
        load_model()

        return jsonify({
            "message": "Model retrained successfully",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/stats", methods=["GET"])
def stats():
    """Get prediction statistics and model info."""
    total = len(prediction_log)
    severity_counts = [0, 0, 0, 0]
    for p in prediction_log:
        sev = p["result"]["severity"]
        if 0 <= sev <= 3:
            severity_counts[sev] += 1

    return jsonify({
        "total_predictions": total,
        "severity_distribution": {
            "low": severity_counts[0],
            "medium": severity_counts[1],
            "high": severity_counts[2],
            "fatal": severity_counts[3]
        },
        "model_loaded": model is not None,
        "recent_predictions": prediction_log[-10:][::-1],
        "timestamp": datetime.now().isoformat()
    })


@app.route("/logs", methods=["GET"])
def logs():
    """Get prediction logs."""
    limit = request.args.get("limit", 50, type=int)
    return jsonify({
        "logs": prediction_log[-limit:][::-1],
        "total": len(prediction_log)
    })


if __name__ == "__main__":
    load_model()
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
