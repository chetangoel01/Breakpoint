# predict.py
import sys
import json
import base64
import cv2
import numpy as np
import joblib
import mediapipe as mp

# Load model
model = joblib.load("rf_drowsiness_model.pkl")
scaler = joblib.load("rf_scaler.pkl")
encoder = joblib.load("rf_label_encoder.pkl")

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 387, 385, 263, 373, 380]
CHIN, FOREHEAD = 152, 10

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True)

def calculate_ear(landmarks, indices):
    pts = np.array([[landmarks[i].x, landmarks[i].y] for i in indices])
    return (np.linalg.norm(pts[1] - pts[5]) + np.linalg.norm(pts[2] - pts[4])) / (2.0 * np.linalg.norm(pts[0] - pts[3]) + 1e-6)

def estimate_pitch(landmarks):
    chin = np.array([landmarks[CHIN].x, landmarks[CHIN].y])
    forehead = np.array([landmarks[FOREHEAD].x, landmarks[FOREHEAD].y])
    return np.arctan2(chin[1] - forehead[1], chin[0] - forehead[0])

def main():
    input_data = json.load(sys.stdin)
    b64_image = input_data.get("image")

    img_bytes = base64.b64decode(b64_image)
    img_np = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    if not results.multi_face_landmarks:
        print(json.dumps({"status": "no_face"}))
        return

    lm = results.multi_face_landmarks[0].landmark
    left_ear = calculate_ear(lm, LEFT_EYE)
    right_ear = calculate_ear(lm, RIGHT_EYE)
    avg_ear = (left_ear + right_ear) / 2.0
    pitch = estimate_pitch(lm)
    ear_std, perclos = 0.01, 0.1  # dummy if no rolling

    X = np.array([[left_ear, right_ear, avg_ear, pitch, ear_std, perclos]])
    X_scaled = scaler.transform(X)
    prob = model.predict_proba(X_scaled)[0]
    idx = np.argmax(prob)
    label = encoder.inverse_transform([idx])[0]

    print(json.dumps({
        "status": label,
        "confidence": float(prob[idx])
    }))

if __name__ == "__main__":
    main()
