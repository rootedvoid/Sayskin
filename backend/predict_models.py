import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
from models.skin_tone.skin_tone_knn import identify_skin_tone

# Load models
skin_model_path = os.path.join("models", "skin_models", "skin_model.keras")
acne_model_path = os.path.join("models", "acne_model", "acne_model.keras")

skin_model = load_model(skin_model_path)
acne_model = load_model(acne_model_path)

# Define class labels
skin_labels = ['Dry', 'Normal', 'Oily']
acne_labels = ['Blackheads', 'Cystic', 'No Acne', 'Papules', 'Pustules', 'Whiteheads']

def prediction_skin(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    prediction = skin_model.predict(img_array)
    predicted_class = skin_labels[np.argmax(prediction)]
    return predicted_class

def prediction_acne(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    prediction = acne_model.predict(img_array)
    predicted_class = acne_labels[np.argmax(prediction)]
    return predicted_class

# Skin tone prediction uses a different approach, already imported as identify_skin_tone
