import React, { useState } from "react";

const Recommendations = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      // Trigger your recommendation logic here
      getRecommendations(reader.result); // passing base64 string
    };
    reader.readAsDataURL(file);
  };

  const getRecommendations = (imageData) => {
    // Example placeholder for recommendation logic
    // You could call an API with imageData or use local logic
    console.log("Processing image for recommendations...", imageData);

    // Simulate dummy recommendations
    setTimeout(() => {
      setRecommendations([
        { id: 1, name: "Hydrating Face Cream", brand: "GlowCo" },
        { id: 2, name: "Vitamin C Serum", brand: "SkinBright" },
        { id: 3, name: "Gentle Cleanser", brand: "PureSkin" },
      ]);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Product Recommendations</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
      />

      {imagePreview && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Uploaded Image:</p>
          <img src={imagePreview} alt="Uploaded" className="w-32 h-32 object-cover rounded-md border" />
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Top Matches:</h3>
          <ul className="space-y-2">
            {recommendations.map((rec) => (
              <li
                key={rec.id}
                className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <p className="font-semibold">{rec.name}</p>
                <p className="text-sm text-gray-600">{rec.brand}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
