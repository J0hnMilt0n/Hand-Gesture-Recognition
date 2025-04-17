from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Import CORS
import numpy as np
from keras.models import load_model
import cv2

app = Flask(__name__)
CORS(app)  # ✅ Add CORS *after* app is defined

model = load_model('cnn8grps_rad1_model.h5')  # Load your model

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        file = request.files['file']
        image = np.array(cv2.imdecode(np.frombuffer(file.read(), np.uint8), -1))        
        image = cv2.resize(image, (400, 400))
        image = image.reshape(1, 400, 400, 3)

        prediction = model.predict(image)
        predicted_class = np.argmax(prediction, axis=1)[0]

        return jsonify({'prediction': str(predicted_class)})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)
