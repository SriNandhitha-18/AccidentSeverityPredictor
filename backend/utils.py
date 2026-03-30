"""
Utility functions for the prediction API.
"""

import numpy as np

SEVERITY_LABELS = ["Low", "Medium", "High", "Fatal"]

CATEGORICAL_FEATURES = [
    "weather", "road_condition", "vehicle_type",
    "traffic_density", "time_of_day", "light_condition"
]
NUMERICAL_FEATURES = ["speed", "driver_age", "alcohol_involvement"]


def preprocess_input(data: dict, encoder, scaler) -> np.ndarray:
    """
    Preprocess a single prediction input using the fitted ColumnTransformer.
    
    Args:
        data: Raw input dictionary from API request
        encoder: Fitted ColumnTransformer (OneHotEncoder + StandardScaler)
        scaler: Not used (kept for backward compat)
    
    Returns:
        Processed feature array ready for model.predict()
    """
    import pandas as pd
    
    # Convert alcohol to numeric
    alcohol = data.get("alcohol_involvement", False)
    if isinstance(alcohol, str):
        alcohol = 1 if alcohol.lower() in ["true", "yes", "1"] else 0
    elif isinstance(alcohol, bool):
        alcohol = 1 if alcohol else 0
    else:
        alcohol = int(alcohol)
    
    # Build DataFrame row matching training format
    row = pd.DataFrame([{
        "weather": str(data["weather"]).lower(),
        "road_condition": str(data["road_condition"]).lower(),
        "vehicle_type": str(data["vehicle_type"]).lower(),
        "traffic_density": str(data["traffic_density"]).lower(),
        "time_of_day": str(data["time_of_day"]).lower(),
        "light_condition": str(data["light_condition"]).lower(),
        "speed": float(data["speed"]),
        "driver_age": int(data["driver_age"]),
        "alcohol_involvement": alcohol,
    }])
    
    # Transform using the fitted ColumnTransformer
    processed = encoder.transform(row)
    
    return processed


def generate_recommendations(severity: int, factors: list) -> list:
    """Generate safety recommendations based on severity and risk factors."""
    recommendations = []
    
    if severity >= 2:
        recommendations.append("Reduce speed immediately")
        recommendations.append("Maintain maximum safe following distance")
    
    if severity >= 3:
        recommendations.append("Consider delaying travel if possible")
        recommendations.append("Deploy emergency response units on standby")
        recommendations.append("Check structural road barriers in the area")
    
    if any("Weather" in f for f in factors):
        recommendations.append("Activate hazard lights in low visibility conditions")
        recommendations.append("Avoid sudden braking on wet or slippery surfaces")
    
    if any("Night" in f for f in factors):
        recommendations.append("Ensure all vehicle lights are fully operational")
        recommendations.append("Increase awareness at intersections and crosswalks")
    
    if any("Alcohol" in f for f in factors):
        recommendations.append("Do not operate vehicle under the influence of alcohol")
        recommendations.append("Arrange alternative transportation immediately")
    
    if any("Speed" in f for f in factors):
        recommendations.append("Reduce speed to within the posted speed limit")
        recommendations.append("Be prepared for sudden stops ahead")
    
    if any("Young" in f or "Elderly" in f for f in factors):
        recommendations.append("Exercise extra caution and avoid distractions")
    
    if any("Bike" in f for f in factors):
        recommendations.append("Wear protective gear including helmet at all times")
        recommendations.append("Stay visible with reflective clothing and lights")
    
    if not recommendations:
        recommendations.append("Standard driving precautions apply")
        recommendations.append("Maintain awareness of surrounding traffic")
        recommendations.append("Keep a safe following distance")
    
    return recommendations[:6]
