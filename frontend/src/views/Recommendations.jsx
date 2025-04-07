import React, { useState } from "react";

const Recommendations = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [skinDetails, setSkinDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result); // base64
      setImagePreviewUrl(reader.result);
      getRecommendations(reader.result); // call backend
    };
    reader.readAsDataURL(file);
  };

  const getRecommendations = async (imageBase64) => {
    setLoading(true);
    try {
      const response = await fetch("https://sayskin.onrender.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const data = await response.json();
      console.log("Backend response:", data);
      setSkinDetails({
        skintone: data.skintone,
        acne: data.acne,
      });
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Upload Your Selfie</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4"
      />

      {imagePreviewUrl && (
        <div className="mb-4">
          <img
            src={imagePreviewUrl}
            alt="Preview"
            className="w-64 h-64 object-cover rounded-xl shadow-lg"
          />
        </div>
      )}

      {loading && <p className="text-blue-500">Analyzing your skin...</p>}

      {skinDetails && (
        <div className="mb-4">
          <p><strong>Skin Tone:</strong> {skinDetails.skintone}</p>
          <p><strong>Acne Level:</strong> {skinDetails.acne}</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Recommended Products:</h3>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li
                key={index}
                className="border p-3 rounded-lg shadow-sm bg-white"
              >
                <p><strong>{rec.name}</strong></p>
                <p>{rec.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
