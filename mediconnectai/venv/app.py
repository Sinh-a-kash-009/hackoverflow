from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)  # Allow backend requests

# Load AI model (zero-shot classification or text classification)
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Predefined possible diseases (you can expand this list)
human_diseases = [
    "common cold", "flu", "dengue", "malaria", "covid-19",
    "allergy", "typhoid", "migraine", "diabetes", "hypertension"
]

animal_diseases = [
    "foot and mouth disease", "mastitis", "canine distemper", 
    "rabies", "parvovirus", "skin infection", "fever"
]

@app.route('/analyze', methods=['POST'])
def analyze_symptoms():
    data = request.get_json()
    symptoms = data.get("symptoms", "")
    type_ = data.get("type", "human")

    if not symptoms:
        return jsonify({"error": "Symptoms not provided"}), 400

    # Choose appropriate disease set
    candidate_labels = human_diseases if type_ == "human" else animal_diseases

    # Run prediction
    result = classifier(symptoms, candidate_labels)
    predicted = result["labels"][0]
    confidence = result["scores"][0]

    return jsonify({
        "predicted_disease": predicted,
        "confidence": round(confidence * 100, 2),
        "possible_matches": result["labels"][:3],
        "scores": [round(s * 100, 2) for s in result["scores"][:3]]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
