# """
# To classify the input skin into one of the 6 skin tones
# """
# import pandas as pd
# import os
# from sklearn.neighbors import KNeighborsClassifier
# from models.skin_tone.skin_detection import skin_detection

# def identify_skin_tone(image_path, dataset):
#     mean_color_values = skin_detection(image_path)
#     df = pd.read_csv(dataset)
#     X = df.iloc[:, [1, 2, 3]].values
#     y = df.iloc[:, 0].values

#     classifier = KNeighborsClassifier(n_neighbors=6, metric='minkowski', p=2)
#     classifier.fit(X, y)

#     X_test = [mean_color_values]
#     y_pred = classifier.predict(X_test)
#     return y_pred[0]

"""
To classify the input skin into one of the 6 skin tones
"""

import pandas as pd
import os
from sklearn.neighbors import KNeighborsClassifier
from models.skin_tone.skin_detection import skin_detection


def identify_skin_tone(image_path, dataset):
    # Check if paths are valid
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    if not os.path.exists(dataset):
        raise FileNotFoundError(f"Dataset not found: {dataset}")

    # Extract mean RGB values from image
    mean_color_values = skin_detection(image_path)
    
    # Validate color vector
    if not isinstance(mean_color_values, (list, tuple)) or len(mean_color_values) != 3:
        raise ValueError(f"Invalid RGB values from skin_detection: {mean_color_values}")
    
    # Load dataset and prepare features and labels
    df = pd.read_csv(dataset)
    X = df.iloc[:, [1, 2, 3]].values  # R, G, B values
    y = df.iloc[:, 0].values         # skin tone labels

    # Train KNN classifier
    classifier = KNeighborsClassifier(n_neighbors=6, metric='minkowski', p=2)
    classifier.fit(X, y)

    # Predict skin tone
    X_test = [mean_color_values]
    y_pred = classifier.predict(X_test)

    return y_pred[0]
