from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import traceback
import os
import logging
import torch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

classifier = None

def load_model():
    global classifier
    try:
        if os.path.exists("./local_model"):
            logger.info("Loading local model...")
            classifier = pipeline(
                "zero-shot-classification",
                model="./local_model",
                device=0 if torch.cuda.is_available() else -1
            )
            logger.info("Model loaded successfully!")
            return True
        else:
            logger.error("Local model not found. Please run download_model.py first")
            return False
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        logger.error("Detailed error:", exc_info=True)
        return False

def analyze_text(text):
    candidate_labels = ["true news", "fake news", "misinformation"]
    result = classifier(
        text,
        candidate_labels,
        hypothesis_template="This text is {}."
    )
    
    # Get the highest scoring label and its score
    max_score_index = result['scores'].index(max(result['scores']))
    predicted_label = result['labels'][max_score_index]
    confidence = result['scores'][max_score_index]
    
    is_fake = predicted_label in ["fake news", "misinformation"]
    return is_fake, confidence

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if classifier is None:
            if not load_model():
                return jsonify({"error": "Model not loaded properly"}), 500

        data = request.json
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text'].strip()
        if not text:
            return jsonify({"error": "Empty text provided"}), 400

        logger.info("Making prediction...")
        is_fake, confidence = analyze_text(text)
        
        logger.info(f"Prediction complete: {'FAKE' if is_fake else 'REAL'} with confidence {confidence:.2f}")

        return jsonify({
            "label": "FAKE" if is_fake else "REAL",
            "confidence": confidence
        })

    except Exception as e:
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    if load_model():
        logger.info("Starting Flask server...")
        app.run(debug=True)
    else:
        logger.error("Failed to start server due to model loading error")
