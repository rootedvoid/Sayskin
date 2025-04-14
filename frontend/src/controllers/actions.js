// // BASE URL of your backend on Render
// const BASE_URL = "https://sayskin-backend.onrender.com";

// export const UploadImage = (imageSrc, navigate) => {
//   fetch(`${BASE_URL}/upload`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ file: imageSrc }), // Assuming backend expects "file"
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       if (data.error) {
//         console.log("Upload Error:", data.error);
//       } else {
//         navigate("/form", { state: { data } });
//         console.log("Upload Success:", data);
//       }
//     })
//     .catch((err) => {
//       console.log("Fetch Error:", err.message);
//     });
// };

// export const putForm = (features, currType, currTone, navigate) => {
//   console.log("Submitting form with:", features, currType, currTone);
//   fetch(`${BASE_URL}/recommend`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       features: features,
//       type: currType,
//       tone: currTone,
//     }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       if (data.error) {
//         console.log("Form submission error:", data.error);
//       } else {
//         navigate("/recs", { state: { data } });
//         console.log("Form submission success:", data);
//       }
//     })



//     .catch((err) => {
//       console.log("Fetch Error:", err.message);
//     });
// };


// // BASE URL of your backend on Render
// const BASE_URL = "https://sayskin-backend.onrender.com";

// export const UploadImage = (imageSrc, navigate) => {
//   console.log("Uploading image for analysis");
  
//   return fetch(`${BASE_URL}/upload`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ file: imageSrc }), // Assuming backend expects "file"
//   })
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error(`Server responded with status ${res.status}`);
//       }
//       return res.json();
//     })
//     .then((data) => {
//       if (data.error) {
//         console.log("Upload Error:", data.error);
//         throw new Error(data.error);
//       } else {
//         console.log("Upload Success:", data);
        
//         // Format the data properly for the form component
//         let formattedData;
        
//         // Handle both formats from backend (old and new)
//         if (data.data) {
//           // New format with nested data object
//           formattedData = data;
//         } else if (data.type && data.tone && data.acne) {
//           // Old format with flat structure - restructure it
//           formattedData = {
//             message: "Analysis complete",
//             data: {
//               type: data.type,
//               tone: parseInt(data.tone), // Make sure tone is a number
//               acne: data.acne
//             }
//           };
//         } else {
//           // Unexpected format
//           console.error("Unexpected data format from server:", data);
//           throw new Error("Unexpected response format from server");
//         }
        
//         // Save to localStorage as backup
//         if (formattedData.data) {
//           localStorage.setItem('skinAnalysisData', JSON.stringify(formattedData.data));
//         }
        
//         // Navigate to form with analysis data
//         navigate("/form", { state: formattedData });
        
//         return formattedData;
//       }
//     })
//     .catch((err) => {
//       console.log("Fetch Error:", err.message);
//       throw err; // Re-throw for the component to handle
//     });
// };

// export const putForm = (features, currType, currTone, navigate) => {
//   console.log("Submitting form with:", features, currType, currTone);
  
//   return fetch(`${BASE_URL}/recommend`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       features: features,
//       type: currType,
//       tone: currTone,
//     }),
//   })
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error(`Server responded with status ${res.status}`);
//       }
//       return res.json();
//     })
//     .then((data) => {
//       if (data.error) {
//         console.log("Form submission error:", data.error);
//         throw new Error(data.error);
//       } else {
//         navigate("/recs", { state: { data } });
//         console.log("Form submission success:", data);
//         return data;
//       }
//     })
//     .catch((err) => {
//       console.log("Fetch Error:", err.message);
//       throw err; // Re-throw for the component to handle
//     });
// };



// BASE URL of your backend on Render
const BASE_URL = "https://sayskin-backend.onrender.com";

// Check if the server is awake and ready to process requests
export const checkServerStatus = async () => {
  try {
    console.log("Checking server status...");
    const response = await fetch(`${BASE_URL}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (response.ok) {
      console.log("Server is up and running!");
      return true;
    } else {
      console.log("Server responded but with an error:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Server check failed:", error);
    return false;
  }
};

export const UploadImage = async (imageSrc, navigate) => {
  console.log("Preparing to upload image");
  
  try {
    // First check if server is responsive
    const isServerUp = await checkServerStatus();
    if (!isServerUp) {
      throw new Error("Server is not responding. It might be starting up, please try again in a moment.");
    }
    
    console.log("Server is ready, uploading image...");
    
    // Make sure the image data is properly formatted
    let imageData = imageSrc;
    // Check if the image already has a data URL prefix, if not add it
    if (imageSrc && !imageSrc.startsWith('data:image/')) {
      imageData = `data:image/jpeg;base64,${imageSrc}`;
    }
    
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: imageData }),
    });

    if (!response.ok) {
      console.error("Server error:", response.status, response.statusText);
      const errorText = await response.text();
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error("Upload Error:", data.error);
      throw new Error(data.error);
    }
    
    console.log("Upload Success:", data);
    
    // Format the data properly for the form component
    let formattedData;
    
    // Handle both formats from backend (old and new)
    if (data.data) {
      // New format with nested data object
      formattedData = data;
    } else if (data.type && data.tone && data.acne) {
      // Old format with flat structure - restructure it
      formattedData = {
        message: "Analysis complete",
        data: {
          type: data.type,
          tone: parseInt(data.tone), // Make sure tone is a number
          acne: data.acne
        }
      };
    } else {
      // Unexpected format
      console.error("Unexpected data format from server:", data);
      throw new Error("Unexpected response format from server");
    }
    
    // Save to localStorage as backup
    if (formattedData.data) {
      localStorage.setItem('skinAnalysisData', JSON.stringify(formattedData.data));
    }
    
    // Navigate to form with analysis data
    navigate("/form", { state: formattedData });
    
    return formattedData;
    
  } catch (err) {
    console.error("Error in UploadImage:", err);
    throw err; // Re-throw for the component to handle
  }
};

export const putForm = async (features, currType, currTone, navigate) => {
  console.log("Submitting form with:", features, currType, currTone);
  
  try {
    // Check if server is responsive first
    const isServerUp = await checkServerStatus();
    if (!isServerUp) {
      throw new Error("Server is not responding. It might be starting up, please try again in a moment.");
    }
    
    const response = await fetch(`${BASE_URL}/recommend`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        features: features,
        type: currType,
        tone: currTone,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error("Form submission error:", data.error);
      throw new Error(data.error);
    }
    
    navigate("/recs", { state: { data } });
    console.log("Form submission success:", data);
    return data;
    
  } catch (err) {
    console.error("Error in putForm:", err);
    throw err; // Re-throw for the component to handle
  }
};
