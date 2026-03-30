# Accident Severity Prediction — Backend

## Quick Start

```bash
cd backend
pip install -r requirements.txt
python train_model.py   # Train the model first
python app.py           # Start Flask API on port 5000
```

## API Endpoints

### `POST /predict`
Predict accident severity.

**Request:**
```json
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
```

**Response:**
```json
{
  "severity": 2,
  "label": "High",
  "probability": 0.84,
  "confidence": [0.05, 0.08, 0.84, 0.03],
  "factors": ["Adverse Weather: Rainy", "High Speed: 90 km/h", "Alcohol Involvement"],
  "recommendations": ["Reduce speed immediately", "..."]
}
```

### `POST /train`
Retrain model. Optionally upload CSV with `multipart/form-data` (field: `file`).

### `GET /stats`
Returns prediction stats and recent logs.

### `GET /health`
Health check.

## Valid Input Values

| Field | Values |
|-------|--------|
| weather | sunny, rainy, foggy, storm |
| road_condition | dry, wet, damaged |
| vehicle_type | car, bike, truck, bus |
| speed | 0-300 (km/h) |
| driver_age | 16-100 |
| traffic_density | low, medium, high |
| time_of_day | morning, afternoon, evening, night |
| light_condition | day, night |
| alcohol_involvement | true/false |

## Connecting Frontend

Set `VITE_API_URL` in your frontend `.env`:
```
VITE_API_URL=http://localhost:5000
```

## Deployment

**Railway / Render:**
```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```
