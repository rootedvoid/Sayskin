import os
import base64
import traceback
import io
from io import BytesIO
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from flask import Flask, request, jsonify, send_from_directory
from flask_restful import Api, Resource, reqparse
from models.skin_tone.skin_tone_knn import identify_skin_tone
from models.recommender.rec import recs_essentials, makeup_recommendation
from flask_cors import CORS


# Initialize Flask app
app = Flask(__name__)
# Set up CORS with explicit parameters
CORS(app, resources={r"/*": {"origins": "*", 
                            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]}})
api = Api(app)

# Create static directory if it doesn't exist
os.makedirs('./static', exist_ok=True)

# Class labels
class_names1 = ['Dry_skin', 'Normal_skin', 'Oil_skin']
class_names2 = ['Low', 'Moderate', 'Severe']
skin_tone_dataset = 'models/skin_tone/skin_tone_dataset.csv'

# Load Models
def get_model():
    global model1, model2
    try:
        model1 = load_model('./models/skin_model/skin_model.keras')
        print('✅ Model 1 loaded successfully')
    except Exception as e:
        print(f'❌ Error loading Model 1: {str(e)}')
        model1 = None

    try:
        model2 = load_model('./models/acne_model/acne_model.keras')
        print("✅ Model 2 loaded successfully")
    except Exception as e:
        print(f'❌ Error loading Model 2: {str(e)}')
        model2 = None

get_model()

# Image processing function
def load_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_tensor = image.img_to_array(img)
    img_tensor = np.expand_dims(img_tensor, axis=0)
    img_tensor /= 255.
    return img_tensor

# Prediction functions
def prediction_skin(img_path):
    try:
        if model1 is None:
            return "Model 1 not loaded"
        new_image = load_image(img_path)
        pred1 = model1.predict(new_image)
        return class_names1[np.argmax(pred1[0])]
    except Exception as e:
        print(f"Error in skin prediction: {str(e)}")
        return f"Error in skin prediction: {str(e)}"

def prediction_acne(img_path):
    try:
        if model2 is None:
            return "Model 2 not loaded"
        new_image = load_image(img_path)
        pred2 = model2.predict(new_image)
        return class_names2[np.argmax(pred2[0])]
    except Exception as e:
        print(f"Error in acne prediction: {str(e)}")
        return f"Error in acne prediction: {str(e)}"

# Home route
@app.route('/')
def home():
    return jsonify({"message": "Backend is running"}), 200

# Add explicit CORS preflight handler
@app.route('/upload', methods=['OPTIONS'])
def upload_options():
    response = app.make_default_options_response()
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

# Replace your current upload route with this simplified version
@app.route('/upload', methods=['POST'])
def upload():
    print("==== UPLOAD REQUEST RECEIVED ====")
    try:
        # First, just log everything we can about the request
        print(f"Content-Type: {request.content_type}")
        print(f"Request method: {request.method}")
        print(f"Is JSON: {request.is_json}")
        print(f"Files: {request.files}")
        print(f"Form: {request.form}")
        
        # Step 1: Just try to process the image (nothing else)
        # Handle different input types
        if request.content_type and 'application/json' in request.content_type:
            # Handle base64 JSON image upload
            print("Processing JSON data")
            data = request.get_json()
            if not data:
                print("No JSON data found")
                return jsonify({"error": "No JSON data provided"}), 400
                
            if "file" not in data:
                print("No file key in JSON")
                return jsonify({"error": "No file provided in JSON"}), 400

            try:
                # Handle both with and without data URL prefix
                if ',' in data["file"]:
                    print("Data URI format detected")
                    base64_str = data["file"].split(',')[1]
                else:
                    print("Raw base64 format detected")
                    base64_str = data["file"]
                    
                print(f"Base64 string length: {len(base64_str)}")
                image_data = base64.b64decode(base64_str)
                print(f"Decoded image data length: {len(image_data)}")
                
                # Try to open the image
                im = Image.open(BytesIO(image_data))
                print(f"Image opened successfully. Format: {im.format}, Size: {im.size}, Mode: {im.mode}")
            except Exception as img_err:
                print(f"ERROR processing base64 image: {str(img_err)}")
                traceback.print_exc()
                return jsonify({"error": f"Invalid image data: {str(img_err)}"}), 400

        elif request.files and 'file' in request.files:
            # Handle form-data upload
            print("Processing form-data upload")
            uploaded_file = request.files['file']
            if uploaded_file.filename == '':
                print("Empty filename")
                return jsonify({"error": "No file selected"}), 400
                
            try:
                print(f"File name: {uploaded_file.filename}")
                im = Image.open(uploaded_file)
                print(f"Image opened successfully. Format: {im.format}, Size: {im.size}, Mode: {im.mode}")
            except Exception as img_err:
                print(f"ERROR opening uploaded file: {str(img_err)}")
                traceback.print_exc()
                return jsonify({"error": f"Invalid image format: {str(img_err)}"}), 400
        else:
            print(f"Invalid request format. Content-Type: {request.content_type}")
            print(f"Request data: {request.data}")
            return jsonify({"error": "No valid image provided. Send either JSON with base64 or form-data with file."}), 400

        # Step 2: Try to save the image
        try:
            # Ensure static directory exists
            if not os.path.exists('./static'):
                os.makedirs('./static')
                print("Created static directory")
                
            file_path = "./static/image.png"
            print(f"Saving image to {file_path}")
            im.save(file_path)
            print("Image saved successfully")
        except Exception as save_err:
            print(f"ERROR saving image: {str(save_err)}")
            traceback.print_exc()
            return jsonify({"error": f"Error saving image: {str(save_err)}"}), 500

        # Step 3: Check if skin tone dataset exists
        if not os.path.exists(skin_tone_dataset):
            print(f"ERROR: Skin tone dataset not found at {skin_tone_dataset}")
            return jsonify({"error": f"Skin tone dataset not found at {skin_tone_dataset}"}), 500
        else:
            print(f"Skin tone dataset found at {skin_tone_dataset}")

        # # Step 4: For testing, return success without processing
        # # Comment out this return statement when you want to test the full processing
        # return jsonify({"message": "Image uploaded and saved successfully"}), 200

        # # Step 5: Try running predictions one by one
        # try:
        #     print("Running skin type prediction")
        #     skin_type = prediction_skin(file_path)
        #     print(f"Skin type result: {skin_type}")
        # except Exception as skin_err:
        #     print(f"ERROR in skin prediction: {str(skin_err)}")
        #     traceback.print_exc()
        #     return jsonify({"error": f"Error in skin prediction: {str(skin_err)}"}), 500
            
        # try:
        #     print("Running acne prediction")
        #     acne_type = prediction_acne(file_path)
        #     print(f"Acne type result: {acne_type}")
        # except Exception as acne_err:
        #     print(f"ERROR in acne prediction: {str(acne_err)}")
        #     traceback.print_exc()
        #     return jsonify({"error": f"Error in acne prediction: {str(acne_err)}"}), 500
            
        # try:
        #     print("Running skin tone identification")
        #     tone = identify_skin_tone(file_path, dataset=skin_tone_dataset)
        #     print(f"Tone result: {tone}")
        # except Exception as tone_err:
        #     print(f"ERROR in tone identification: {str(tone_err)}")
        #     traceback.print_exc()
        #     return jsonify({"error": f"Error in tone identification: {str(tone_err)}"}), 500

        # # Final response
        # result = {
        #     "message": "Image uploaded successfully",
        #     "type": skin_type,
        #     "tone": str(tone),
        #     "acne": acne_type
        # }
        # print("Returning successful response:", result)
        # return jsonify(result), 200

    except Exception as e:
        print("UNHANDLED EXCEPTION in upload route:")
        traceback.print_exc()
        print(f"Error details: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    print("==== ANALYZE REQUEST RECEIVED ====")
    try:
        # Handle base64 in JSON
        if request.is_json:
            data = request.get_json()
            if "file" not in data:
                return jsonify({"error": "No file key in JSON"}), 400
            
            if ',' in data["file"]:
                base64_str = data["file"].split(',')[1]
            else:
                base64_str = data["file"]
            
            image_data = base64.b64decode(base64_str)
            im = Image.open(BytesIO(image_data))
        
        # Handle file upload (form-data)
        elif 'file' in request.files:
            uploaded_file = request.files['file']
            if uploaded_file.filename == '':
                return jsonify({"error": "No file selected"}), 400
            im = Image.open(uploaded_file)

        else:
            return jsonify({"error": "No valid image provided"}), 400

        # Save to static folder
        file_path = "./static/analyze_input.png"
        im.save(file_path)

        # Run predictions
        skin_type = prediction_skin(file_path)
        acne_type = prediction_acne(file_path)
        tone = identify_skin_tone(file_path, dataset=skin_tone_dataset)

        # Return predictions
        result = {
            "message": "Analysis complete",
            "type": skin_type,
            "acne": acne_type,
            "tone": str(tone)
        }
        return jsonify(result), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# Recommendation API
rec_args = reqparse.RequestParser()
rec_args.add_argument("tone", type=int, required=True)
rec_args.add_argument("type", type=str, required=True)
rec_args.add_argument("features", type=dict, required=True)

class Recommendation(Resource):
    def put(self):
        try:
            args = rec_args.parse_args()
            features = args['features']
            tone = args['tone']
            skin_type = args['type'].lower()
            skin_tone = 'light to medium' if 2 < tone < 4 else 'fair to light' if tone <= 2 else 'medium to dark'
            fv = [int(value) for key, value in features.items()]
            general = recs_essentials(fv, None)
            makeup = makeup_recommendation(skin_tone, skin_type)
            return {'general': general, 'makeup': makeup}
        except Exception as e:
            traceback.print_exc()
            return {"error": str(e)}, 500

# Create a simple manifest.json if it doesn't exist
@app.route('/manifest.json')
def serve_manifest():
    try:
        # Create a default manifest.json if it doesn't exist
        if not os.path.exists('./static/manifest.json'):
            with open('./static/manifest.json', 'w') as f:
                f.write('{"name":"Skin Analysis App","short_name":"SkinApp","start_url":"/","display":"standalone"}')
        
        return send_from_directory('./static', 'manifest.json')
    except Exception as e:
        print(f"Error serving manifest.json: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Create a default route for favicon.ico
@app.route('/favicon.ico')
def favicon():
    try:
        # Create a basic favicon.ico if it doesn't exist
        if not os.path.exists('./static/favicon.ico'):
            # Create an empty favicon file
            with open('./static/favicon.ico', 'wb') as f:
                f.write(b'')
                
        return send_from_directory('./static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')
    except Exception as e:
        print(f"Error serving favicon.ico: {str(e)}")
        return "", 204  # Return no content instead of error

# Add API resources
api.add_resource(Recommendation, "/recommend")

# Add global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    print(f"Unhandled exception: {str(e)}")
    traceback.print_exc()
    return jsonify({"error": "Internal server error"}), 500

# Run app
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

# import os
# import base64
# import traceback
# import io
# from io import BytesIO
# import numpy as np
# from PIL import Image
# import tensorflow as tf
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image
# from flask import Flask, request, jsonify, send_from_directory
# from flask_restful import Api, Resource, reqparse
# from models.skin_tone.skin_tone_knn import identify_skin_tone
# from models.recommender.rec import recs_essentials, makeup_recommendation
# from flask_cors import CORS


# # Initialize Flask app
# app = Flask(__name__)
# # Set up CORS with explicit parameters
# CORS(app, resources={r"/*": {"origins": "*", 
#                             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#                             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]}})
# api = Api(app)

# # Create static directory if it doesn't exist
# os.makedirs('./static', exist_ok=True)

# # Class labels
# class_names1 = ['Dry_skin', 'Normal_skin', 'Oil_skin']
# class_names2 = ['Low', 'Moderate', 'Severe']
# skin_tone_dataset = 'models/skin_tone/skin_tone_dataset.csv'

# # Load Models
# def get_model():
#     global model1, model2
#     try:
#         model1 = load_model('./models/skin_model/skin_model.keras')
#         print('✅ Model 1 loaded successfully')
#     except Exception as e:
#         print(f'❌ Error loading Model 1: {str(e)}')
#         model1 = None

#     try:
#         model2 = load_model('./models/acne_model/acne_model.keras')
#         print("✅ Model 2 loaded successfully")
#     except Exception as e:
#         print(f'❌ Error loading Model 2: {str(e)}')
#         model2 = None

# get_model()

# # Image processing function
# def load_image(img_path):
#     img = image.load_img(img_path, target_size=(224, 224))
#     img_tensor = image.img_to_array(img)
#     img_tensor = np.expand_dims(img_tensor, axis=0)
#     img_tensor /= 255.
#     return img_tensor

# # Prediction functions
# def prediction_skin(img_path):
#     try:
#         if model1 is None:
#             return "Model 1 not loaded"
#         new_image = load_image(img_path)
#         pred1 = model1.predict(new_image)
#         return class_names1[np.argmax(pred1[0])]
#     except Exception as e:
#         print(f"Error in skin prediction: {str(e)}")
#         return f"Error in skin prediction: {str(e)}"

# def prediction_acne(img_path):
#     try:
#         if model2 is None:
#             return "Model 2 not loaded"
#         new_image = load_image(img_path)
#         pred2 = model2.predict(new_image)
#         return class_names2[np.argmax(pred2[0])]
#     except Exception as e:
#         print(f"Error in acne prediction: {str(e)}")
#         return f"Error in acne prediction: {str(e)}"

# # Home route
# @app.route('/')
# def home():
#     return jsonify({"message": "Backend is running"}), 200

# # Add explicit CORS preflight handler
# @app.route('/upload', methods=['OPTIONS'])
# def upload_options():
#     response = app.make_default_options_response()
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
#     response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
#     return response

# # Replace your current upload route with this simplified version
# @app.route('/upload', methods=['POST'])
# def upload():
#     print("==== UPLOAD REQUEST RECEIVED ====")
#     try:
#         # First, just log everything we can about the request
#         print(f"Content-Type: {request.content_type}")
#         print(f"Request method: {request.method}")
#         print(f"Is JSON: {request.is_json}")
#         print(f"Files: {request.files}")
#         print(f"Form: {request.form}")
        
#         # Step 1: Just try to process the image (nothing else)
#         # Handle different input types
#         if request.content_type and 'application/json' in request.content_type:
#             # Handle base64 JSON image upload
#             print("Processing JSON data")
#             data = request.get_json()
#             if not data:
#                 print("No JSON data found")
#                 return jsonify({"error": "No JSON data provided"}), 400
                
#             if "file" not in data:
#                 print("No file key in JSON")
#                 return jsonify({"error": "No file provided in JSON"}), 400

#             try:
#                 # Handle both with and without data URL prefix
#                 if ',' in data["file"]:
#                     print("Data URI format detected")
#                     base64_str = data["file"].split(',')[1]
#                 else:
#                     print("Raw base64 format detected")
#                     base64_str = data["file"]
                    
#                 print(f"Base64 string length: {len(base64_str)}")
#                 image_data = base64.b64decode(base64_str)
#                 print(f"Decoded image data length: {len(image_data)}")
                
#                 # Try to open the image
#                 im = Image.open(BytesIO(image_data))
#                 print(f"Image opened successfully. Format: {im.format}, Size: {im.size}, Mode: {im.mode}")
#             except Exception as img_err:
#                 print(f"ERROR processing base64 image: {str(img_err)}")
#                 traceback.print_exc()
#                 return jsonify({"error": f"Invalid image data: {str(img_err)}"}), 400

#         elif request.files and 'file' in request.files:
#             # Handle form-data upload
#             print("Processing form-data upload")
#             uploaded_file = request.files['file']
#             if uploaded_file.filename == '':
#                 print("Empty filename")
#                 return jsonify({"error": "No file selected"}), 400
                
#             try:
#                 print(f"File name: {uploaded_file.filename}")
#                 im = Image.open(uploaded_file)
#                 print(f"Image opened successfully. Format: {im.format}, Size: {im.size}, Mode: {im.mode}")
#             except Exception as img_err:
#                 print(f"ERROR opening uploaded file: {str(img_err)}")
#                 traceback.print_exc()
#                 return jsonify({"error": f"Invalid image format: {str(img_err)}"}), 400
#         else:
#             print(f"Invalid request format. Content-Type: {request.content_type}")
#             print(f"Request data: {request.data}")
#             return jsonify({"error": "No valid image provided. Send either JSON with base64 or form-data with file."}), 400

#         # Step 2: Try to save the image
#         try:
#             # Ensure static directory exists
#             if not os.path.exists('./static'):
#                 os.makedirs('./static')
#                 print("Created static directory")
                
#             file_path = "./static/image.png"
#             print(f"Saving image to {file_path}")
#             im.save(file_path)
#             print("Image saved successfully")
#         except Exception as save_err:
#             print(f"ERROR saving image: {str(save_err)}")
#             traceback.print_exc()
#             return jsonify({"error": f"Error saving image: {str(save_err)}"}), 500

#         # Step 3: Check if skin tone dataset exists
#         if not os.path.exists(skin_tone_dataset):
#             print(f"ERROR: Skin tone dataset not found at {skin_tone_dataset}")
#             return jsonify({"error": f"Skin tone dataset not found at {skin_tone_dataset}"}), 500
#         else:
#             print(f"Skin tone dataset found at {skin_tone_dataset}")

#         # Step 4: For testing, return success without processing
#         # Comment out this return statement when you want to test the full processing
#         return jsonify({"message": "Image uploaded and saved successfully"}), 200

#         # Step 5: Try running predictions one by one
#         try:
#             print("Running skin type prediction")
#             skin_type = prediction_skin(file_path)
#             print(f"Skin type result: {skin_type}")
#         except Exception as skin_err:
#             print(f"ERROR in skin prediction: {str(skin_err)}")
#             traceback.print_exc()
#             return jsonify({"error": f"Error in skin prediction: {str(skin_err)}"}), 500
            
#         try:
#             print("Running acne prediction")
#             acne_type = prediction_acne(file_path)
#             print(f"Acne type result: {acne_type}")
#         except Exception as acne_err:
#             print(f"ERROR in acne prediction: {str(acne_err)}")
#             traceback.print_exc()
#             return jsonify({"error": f"Error in acne prediction: {str(acne_err)}"}), 500
            
#         try:
#             print("Running skin tone identification")
#             tone = identify_skin_tone(file_path, dataset=skin_tone_dataset)
#             print(f"Tone result: {tone}")
#         except Exception as tone_err:
#             print(f"ERROR in tone identification: {str(tone_err)}")
#             traceback.print_exc()
#             return jsonify({"error": f"Error in tone identification: {str(tone_err)}"}), 500


# # Final response
# result = {
#     "message": "Image uploaded successfully",
#     "type": skin_type,  # Now "Oily", "Normal", "Dry"
#     "tone": str(tone),
#     "acne": acne_type
# }
#         print("Returning successful response:", result)
#         return jsonify(result), 200

#     except Exception as e:
#         print("UNHANDLED EXCEPTION in upload route:")
#         traceback.print_exc()
#         print(f"Error details: {str(e)}")
#         return jsonify({"error": f"Server error: {str(e)}"}), 500

# @app.route('/analyze', methods=['POST'])
# def analyze():
#     print("==== ANALYZE REQUEST RECEIVED ====")
#     try:
#         # Handle base64 in JSON
#         if request.is_json:
#             data = request.get_json()
#             if "file" not in data:
#                 return jsonify({"error": "No file key in JSON"}), 400
            
#             if ',' in data["file"]:
#                 base64_str = data["file"].split(',')[1]
#             else:
#                 base64_str = data["file"]
            
#             image_data = base64.b64decode(base64_str)
#             im = Image.open(BytesIO(image_data))
        
#         # Handle file upload (form-data)
#         elif 'file' in request.files:
#             uploaded_file = request.files['file']
#             if uploaded_file.filename == '':
#                 return jsonify({"error": "No file selected"}), 400
#             im = Image.open(uploaded_file)

#         else:
#             return jsonify({"error": "No valid image provided"}), 400

#         # Save to static folder
#         file_path = "./static/analyze_input.png"
#         im.save(file_path)

#         # Run predictions
#         skin_type = prediction_skin(file_path)
#         acne_type = prediction_acne(file_path)
#         tone = identify_skin_tone(file_path, dataset=skin_tone_dataset)


# # Final response
# result = {
#     "message": "Image uploaded successfully",
#     "type": skin_type,  # Now "Oily", "Normal", "Dry"
#     "tone": str(tone),
#     "acne": acne_type
# }
#         return jsonify(result), 200

#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({"error": f"Server error: {str(e)}"}), 500


# # Recommendation API
# rec_args = reqparse.RequestParser()
# rec_args.add_argument("tone", type=int, required=True)
# rec_args.add_argument("type", type=str, required=True)
# rec_args.add_argument("features", type=dict, required=True)

# class Recommendation(Resource):
#     def put(self):
#         try:
#             args = rec_args.parse_args()
#             features = args['features']
#             tone = args['tone']
#             skin_type = args['type'].lower()
#             skin_tone = 'light to medium' if 2 < tone < 4 else 'fair to light' if tone <= 2 else 'medium to dark'
#             fv = [int(value) for key, value in features.items()]
#             general = recs_essentials(fv, None)
#             makeup = makeup_recommendation(skin_tone, skin_type)
#             return {'general': general, 'makeup': makeup}
#         except Exception as e:
#             traceback.print_exc()
#             return {"error": str(e)}, 500

# # Create a simple manifest.json if it doesn't exist
# @app.route('/manifest.json')
# def serve_manifest():
#     try:
#         # Create a default manifest.json if it doesn't exist
#         if not os.path.exists('./static/manifest.json'):
#             with open('./static/manifest.json', 'w') as f:
#                 f.write('{"name":"Skin Analysis App","short_name":"SkinApp","start_url":"/","display":"standalone"}')
        
#         return send_from_directory('./static', 'manifest.json')
#     except Exception as e:
#         print(f"Error serving manifest.json: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# # Create a default route for favicon.ico
# @app.route('/favicon.ico')
# def favicon():
#     try:
#         # Create a basic favicon.ico if it doesn't exist
#         if not os.path.exists('./static/favicon.ico'):
#             # Create an empty favicon file
#             with open('./static/favicon.ico', 'wb') as f:
#                 f.write(b'')
                
#         return send_from_directory('./static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')
#     except Exception as e:
#         print(f"Error serving favicon.ico: {str(e)}")
#         return "", 204  # Return no content instead of error

# # Add API resources
# api.add_resource(Recommendation, "/recommend")

# # Add global error handler
# @app.errorhandler(Exception)
# def handle_exception(e):
#     print(f"Unhandled exception: {str(e)}")
#     traceback.print_exc()
#     return jsonify({"error": "Internal server error"}), 500

# # Run app
# if __name__ == "__main__":
#     app.run(debug=True, host="0.0.0.0", port=5000)
# #

# # import os
# # import base64
# # import traceback
# # import io
# # from io import BytesIO
# # import numpy as np
# # from PIL import Image
# # import tensorflow as tf
# # from tensorflow.keras.models import load_model
# # from tensorflow.keras.preprocessing import image
# # from flask import Flask, request, jsonify, send_from_directory
# # from flask_restful import Api, Resource, reqparse
# # from models.skin_tone.skin_tone_knn import identify_skin_tone
# # from models.recommender.rec import recs_essentials, makeup_recommendation
# # from flask_cors import CORS


# # # Initialize Flask app
# # app = Flask(__name__)
# # # Set up CORS with explicit parameters
# # CORS(app, resources={r"/*": {"origins": "*", 
# #                             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
# #                             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]}})
# # api = Api(app)

# # # Create static directory if it doesn't exist
# # os.makedirs('./static', exist_ok=True)

# # # Class labels
# # class_names1 = ['Dry_skin', 'Normal_skin', 'Oil_skin']
# # class_names2 = ['Low', 'Moderate', 'Severe']
# # skin_tone_dataset = 'models/skin_tone/skin_tone_dataset.csv'

# # # Load Models
# # def get_model():
# #     global model1, model2
# #     try:
# #         model1 = load_model('./models/skin_model/skin_model.keras')
# #         print('✅ Model 1 loaded successfully')
# #     except Exception as e:
# #         print(f'❌ Error loading Model 1: {str(e)}')
# #         model1 = None

# #     try:
# #         model2 = load_model('./models/acne_model/acne_model.keras')
# #         print("✅ Model 2 loaded successfully")
# #     except Exception as e:
# #         print(f'❌ Error loading Model 2: {str(e)}')
# #         model2 = None

# # get_model()

# # # Image processing function
# # def load_image(img_path):
# #     img = image.load_img(img_path, target_size=(224, 224))
# #     img_tensor = image.img_to_array(img)
# #     img_tensor = np.expand_dims(img_tensor, axis=0)
# #     img_tensor /= 255.
# #     return img_tensor

# # # Prediction functions
# # def prediction_skin(img_path):
# #     try:
# #         if model1 is None:
# #             return "Model 1 not loaded"
# #         new_image = load_image(img_path)
# #         pred1 = model1.predict(new_image)
# #         return class_names1[np.argmax(pred1[0])]
# #     except Exception as e:
# #         print(f"Error in skin prediction: {str(e)}")
# #         return f"Error in skin prediction: {str(e)}"

# # def prediction_acne(img_path):
# #     try:
# #         if model2 is None:
# #             return "Model 2 not loaded"
# #         new_image = load_image(img_path)
# #         pred2 = model2.predict(new_image)
# #         return class_names2[np.argmax(pred2[0])]
# #     except Exception as e:
# #         print(f"Error in acne prediction: {str(e)}")
# #         return f"Error in acne prediction: {str(e)}"

# # # Home route
# # @app.route('/')
# # def home():
# #     return jsonify({"message": "Backend is running"}), 200

# # # Add explicit CORS preflight handler
# # @app.route('/upload', methods=['OPTIONS'])
# # def upload_options():
# #     response = app.make_default_options_response()
# #     response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
# #     response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
# #     return response

# # # Replace your current upload route with this simplified version
# # @app.route('/upload', methods=['POST'])
# # def upload():
# #     print("==== UPLOAD REQUEST RECEIVED ====")
# #     try:
# #         # First, just log everything we can about the request
# #         print(f"Content-Type: {request.content_type}")
# #         print(f"Request method: {request.method}")
# #         print(f"Is JSON: {request.is_json}")
# #         print(f"Files: {request.files}")
# #         print(f"Form: {request.form}")
        
# #         # Step 1: Just try to process the image (nothing else)
# #         # Handle different input types
# #         if request.content_type and 'application/json' in request.content_type:
# #             # Handle base64 JSON image upload
# #             print("Processing JSON data")
# #             data = request.get_json()
# #             if not data:
# #                 print("No JSON data found")
# #                 return jsonify({"error": "No JSON data provided"}), 400
                
# #             if "file" not in data:
# #                 print("No file key in JSON")
# #                 return jsonify({"error": "No file provided in JSON"}), 400

# #             try:
# #                 # Handle both with and without data URL prefix
# #                 if ',' in data["file"]:
# #                     print("Data URI format detected")
# #                     base64_str = data["file"].split(',')[1]
# #                 else:
# #                     print("Raw base64 format detected")
# #                     base64_str = data["file"]
                    
# #                 print(f"Base64 string length: {len(base64_str)}")
# #                 image_data = base64.b64decode(base64_str)
# #                 print(f"Decoded image data length: {len(image_data)}")
                
# #                 # Try to open the image
# #                 im = Image.open(BytesIO(image_data))
# #                 print(f"Image opened successfully. Format: {im.format}, Size: {im.size}, Mode: {im.mode}")
# #             except Exception as img_err:
# #                 print(f"ERROR processing base64 image: {str(img_err)}")
# #                 traceback.print_exc()
# #                 return jsonify({"error": f"Invalid image data: {str(img_err)}"}), 400

# #         elif request.files and 'file' in request.files:
# #             # Handle form-data upload
# #             print("Processing form-data upload")
# #             uploaded_file = request.files['file']
# #             if uploaded_file.filename == '':
# #                 print("Empty filename")
# #                 return jsonify({"error": "No file selected"}), 400
                
# #             try:
# #                 print(f"File name: {uploaded_file.filename}")
# #                 im = Image.open(uploaded_file)
# #                 print(f"Image opened successfully. Format: {im.format}, Size: {im.size}, Mode: {im.mode}")
# #             except Exception as img_err:
# #                 print(f"ERROR opening uploaded file: {str(img_err)}")
# #                 traceback.print_exc()
# #                 return jsonify({"error": f"Invalid image format: {str(img_err)}"}), 400
# #         else:
# #             print(f"Invalid request format. Content-Type: {request.content_type}")
# #             print(f"Request data: {request.data}")
# #             return jsonify({"error": "No valid image provided. Send either JSON with base64 or form-data with file."}), 400

# #         # Step 2: Try to save the image
# #         try:
# #             # Ensure static directory exists
# #             if not os.path.exists('./static'):
# #                 os.makedirs('./static')
# #                 print("Created static directory")
                
# #             file_path = "./static/image.png"
# #             print(f"Saving image to {file_path}")
# #             im.save(file_path)
# #             print("Image saved successfully")
# #         except Exception as save_err:
# #             print(f"ERROR saving image: {str(save_err)}")
# #             traceback.print_exc()
# #             return jsonify({"error": f"Error saving image: {str(save_err)}"}), 500

# #         # Step 3: Check if skin tone dataset exists
# #         if not os.path.exists(skin_tone_dataset):
# #             print(f"ERROR: Skin tone dataset not found at {skin_tone_dataset}")
# #             return jsonify({"error": f"Skin tone dataset not found at {skin_tone_dataset}"}), 500
# #         else:
# #             print(f"Skin tone dataset found at {skin_tone_dataset}")

# #         # IMPORTANT: Removed the early return that was here

# #         # Step 5: Try running predictions one by one
# #         try:
# #             print("Running skin type prediction")
# #             skin_type = prediction_skin(file_path)
# #             print(f"Skin type result: {skin_type}")
# #         except Exception as skin_err:
# #             print(f"ERROR in skin prediction: {str(skin_err)}")
# #             traceback.print_exc()
# #             return jsonify({"error": f"Error in skin prediction: {str(skin_err)}"}), 500
            
# #         try:
# #             print("Running acne prediction")
# #             acne_type = prediction_acne(file_path)
# #             print(f"Acne type result: {acne_type}")
# #         except Exception as acne_err:
# #             print(f"ERROR in acne prediction: {str(acne_err)}")
# #             traceback.print_exc()
# #             return jsonify({"error": f"Error in acne prediction: {str(acne_err)}"}), 500
            
# #         try:
# #             print("Running skin tone identification")
# #             tone = identify_skin_tone(file_path, dataset=skin_tone_dataset)
# #             print(f"Tone result: {tone}")
# #         except Exception as tone_err:
# #             print(f"ERROR in tone identification: {str(tone_err)}")
# #             traceback.print_exc()
# #             return jsonify({"error": f"Error in tone identification: {str(tone_err)}"}), 500

# #         # Transform skin_type to match frontend expectations
# #         frontend_skin_type = skin_type.replace("_skin", "")
# #         if frontend_skin_type == "Oil":
# #             frontend_skin_type = "Oily"

# #         # Final response
# #         result = {
# #             "message": "Image uploaded successfully",
# #             "type": frontend_skin_type,  # Now "Oily", "Normal", "Dry"
# #             "tone": str(tone),
# #             "acne": acne_type
# #         }
# #         print("Returning successful response:", result)
# #         return jsonify(result), 200

# #     except Exception as e:
# #         print("UNHANDLED EXCEPTION in upload route:")
# #         traceback.print_exc()
# #         print(f"Error details: {str(e)}")
# #         return jsonify({"error": f"Server error: {str(e)}"}), 500

# # @app.route('/analyze', methods=['POST'])
# # def analyze():
# #     print("==== ANALYZE REQUEST RECEIVED ====")
# #     try:
# #         # Handle base64 in JSON
# #         if request.is_json:
# #             data = request.get_json()
# #             if "file" not in data:
# #                 return jsonify({"error": "No file key in JSON"}), 400
            
# #             if ',' in data["file"]:
# #                 base64_str = data["file"].split(',')[1]
# #             else:
# #                 base64_str = data["file"]
            
# #             image_data = base64.b64decode(base64_str)
# #             im = Image.open(BytesIO(image_data))
        
# #         # Handle file upload (form-data)
# #         elif 'file' in request.files:
# #             uploaded_file = request.files['file']
# #             if uploaded_file.filename == '':
# #                 return jsonify({"error": "No file selected"}), 400
# #             im = Image.open(uploaded_file)

# #         else:
# #             return jsonify({"error": "No valid image provided"}), 400

# #         # Save to static folder
# #         file_path = "./static/analyze_input.png"
# #         im.save(file_path)

# #         # Run predictions
# #         skin_type = prediction_skin(file_path)
# #         acne_type = prediction_acne(file_path)
# #         tone = identify_skin_tone(file_path, dataset=skin_tone_dataset)

# #         # Transform skin_type to match frontend expectations
# #         frontend_skin_type = skin_type.replace("_skin", "")
# #         if frontend_skin_type == "Oil":
# #             frontend_skin_type = "Oily"

# #         # Final response
# #         result = {
# #             "message": "Analysis complete",
# #             "type": frontend_skin_type,  # Now "Oily", "Normal", "Dry"
# #             "tone": str(tone),
# #             "acne": acne_type
# #         }
# #         return jsonify(result), 200

# #     except Exception as e:
# #         traceback.print_exc()
# #         return jsonify({"error": f"Server error: {str(e)}"}), 500


# # # Recommendation API
# # rec_args = reqparse.RequestParser()
# # rec_args.add_argument("tone", type=int, required=True)
# # rec_args.add_argument("type", type=str, required=True)
# # rec_args.add_argument("features", type=dict, required=True)

# # class Recommendation(Resource):
# #     def put(self):
# #         try:
# #             args = rec_args.parse_args()
# #             features = args['features']
# #             tone = args['tone']
# #             skin_type = args['type'].lower()
# #             skin_tone = 'light to medium' if 2 < tone < 4 else 'fair to light' if tone <= 2 else 'medium to dark'
# #             fv = [int(value) for key, value in features.items()]
# #             general = recs_essentials(fv, None)
# #             makeup = makeup_recommendation(skin_tone, skin_type)
# #             return {'general': general, 'makeup': makeup}
# #         except Exception as e:
# #             traceback.print_exc()
# #             return {"error": str(e)}, 500

# # # Create a simple manifest.json if it doesn't exist
# # @app.route('/manifest.json')
# # def serve_manifest():
# #     try:
# #         # Create a default manifest.json if it doesn't exist
# #         if not os.path.exists('./static/manifest.json'):
# #             with open('./static/manifest.json', 'w') as f:
# #                 f.write('{"name":"Skin Analysis App","short_name":"SkinApp","start_url":"/","display":"standalone"}')
        
# #         return send_from_directory('./static', 'manifest.json')
# #     except Exception as e:
# #         print(f"Error serving manifest.json: {str(e)}")
# #         return jsonify({"error": str(e)}), 500

# # # Create a default route for favicon.ico
# # @app.route('/favicon.ico')
# # def favicon():
# #     try:
# #         # Create a basic favicon.ico if it doesn't exist
# #         if not os.path.exists('./static/favicon.ico'):
# #             # Create an empty favicon file
# #             with open('./static/favicon.ico', 'wb') as f:
# #                 f.write(b'')
                
# #         return send_from_directory('./static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')
# #     except Exception as e:
# #         print(f"Error serving favicon.ico: {str(e)}")
# #         return "", 204  # Return no content instead of error

# # # Add API resources
# # api.add_resource(Recommendation, "/recommend")

# # # Add global error handler
# # @app.errorhandler(Exception)
# # def handle_exception(e):
# #     print(f"Unhandled exception: {str(e)}")
# #     traceback.print_exc()
# #     return jsonify({"error": "Internal server error"}), 500

# # # Run app with environment-aware port configuration
# # if __name__ == "__main__":
# #     # Use the port provided by the environment or default to 5000
# #     port = int(os.environ.get("PORT", 5000))
# #     # Set debug to False for production environments
# #     debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
# #     app.run(debug=debug_mode, host="0.0.0.0", port=port)
