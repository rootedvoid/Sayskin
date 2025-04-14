

// // // // BASE URL of your backend on Render
// // // const BASE_URL = "https://sayskin-backend.onrender.com";

// // // export const UploadImage = (imageSrc, navigate) => {
// // //   fetch(`${BASE_URL}/upload`, {
// // //     method: "POST",
// // //     headers: {
// // //       "Content-Type": "application/json",
// // //     },
// // //     body: JSON.stringify({ file: imageSrc }), // Assuming backend expects "file"
// // //   })
// // //     .then((res) => res.json())
// // //     .then((data) => {
// // //       if (data.error) {
// // //         console.log("Upload Error:", data.error);
// // //       } else {
// // //         navigate("/form", { state: { data } });
// // //         console.log("Upload Success:", data);
// // //       }
// // //     })
// // //     .catch((err) => {
// // //       console.log("Fetch Error:", err.message);
// // //     });
// // // };

// // // export const putForm = (features, currType, currTone, navigate) => {
// // //   console.log("Submitting form with:", features, currType, currTone);
// // //   fetch(`${BASE_URL}/recommend`, {
// // //     method: "PUT",
// // //     headers: {
// // //       "Content-Type": "application/json",
// // //     },
// // //     body: JSON.stringify({
// // //       features: features,
// // //       type: currType,
// // //       tone: currTone,
// // //     }),
// // //   })
// // //     .then((res) => res.json())
// // //     .then((data) => {
// // //       if (data.error) {
// // //         console.log("Form submission error:", data.error);
// // //       } else {
// // //         navigate("/recs", { state: { data } });
// // //         console.log("Form submission success:", data);
// // //       }
// // //     })



// // //     .catch((err) => {
// // //       console.log("Fetch Error:", err.message);
// // //     });
// // // };


// // // // BASE URL of your backend on Render
// // // const BASE_URL = "https://sayskin-backend.onrender.com";

// // // export const UploadImage = (imageSrc, navigate) => {
// // //   console.log("Uploading image for analysis");
  
// // //   return fetch(`${BASE_URL}/upload`, {
// // //     method: "POST",
// // //     headers: {
// // //       "Content-Type": "application/json",
// // //     },
// // //     body: JSON.stringify({ file: imageSrc }), // Assuming backend expects "file"
// // //   })
// // //     .then((res) => {
// // //       if (!res.ok) {
// // //         throw new Error(`Server responded with status ${res.status}`);
// // //       }
// // //       return res.json();
// // //     })
// // //     .then((data) => {
// // //       if (data.error) {
// // //         console.log("Upload Error:", data.error);
// // //         throw new Error(data.error);
// // //       } else {
// // //         console.log("Upload Success:", data);
        
// // //         // Format the data properly for the form component
// // //         let formattedData;
        
// // //         // Handle both formats from backend (old and new)
// // //         if (data.data) {
// // //           // New format with nested data object
// // //           formattedData = data;
// // //         } else if (data.type && data.tone && data.acne) {
// // //           // Old format with flat structure - restructure it
// // //           formattedData = {
// // //             message: "Analysis complete",
// // //             data: {
// // //               type: data.type,
// // //               tone: parseInt(data.tone), // Make sure tone is a number
// // //               acne: data.acne
// // //             }
// // //           };
// // //         } else {
// // //           // Unexpected format
// // //           console.error("Unexpected data format from server:", data);
// // //           throw new Error("Unexpected response format from server");
// // //         }
        
// // //         // Save to localStorage as backup
// // //         if (formattedData.data) {
// // //           localStorage.setItem('skinAnalysisData', JSON.stringify(formattedData.data));
// // //         }
        
// // //         // Navigate to form with analysis data
// // //         navigate("/form", { state: formattedData });
        
// // //         return formattedData;
// // //       }
// // //     })
// // //     .catch((err) => {
// // //       console.log("Fetch Error:", err.message);
// // //       throw err; // Re-throw for the component to handle
// // //     });
// // // };

// // // export const putForm = (features, currType, currTone, navigate) => {
// // //   console.log("Submitting form with:", features, currType, currTone);
  
// // //   return fetch(`${BASE_URL}/recommend`, {
// // //     method: "PUT",
// // //     headers: {
// // //       "Content-Type": "application/json",
// // //     },
// // //     body: JSON.stringify({
// // //       features: features,
// // //       type: currType,
// // //       tone: currTone,
// // //     }),
// // //   })
// // //     .then((res) => {
// // //       if (!res.ok) {
// // //         throw new Error(`Server responded with status ${res.status}`);
// // //       }
// // //       return res.json();
// // //     })
// // //     .then((data) => {
// // //       if (data.error) {
// // //         console.log("Form submission error:", data.error);
// // //         throw new Error(data.error);
// // //       } else {
// // //         navigate("/recs", { state: { data } });
// // //         console.log("Form submission success:", data);
// // //         return data;
// // //       }
// // //     })
// // //     .catch((err) => {
// // //       console.log("Fetch Error:", err.message);
// // //       throw err; // Re-throw for the component to handle
// // //     });
// // // };


// // BASE URL of your backend on Render
// // Try multiple CORS proxies in case one fails
// const CORS_PROXIES = [
//   "https://corsproxy.io/?",
//   "https://cors-anywhere.herokuapp.com/",
//   "" // No proxy as fallback
// ];
// const BACKEND_URL = "https://sayskin-backend.onrender.com";
// let currentProxyIndex = 0;

// // Helper to get the current BASE_URL with proxy
// const getBaseUrl = () => {
//   return CORS_PROXIES[currentProxyIndex] + BACKEND_URL;
// };

// // Try another proxy if the current one fails
// const rotateProxy = () => {
//   currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
//   console.log(`Switching to proxy: ${CORS_PROXIES[currentProxyIndex]}`);
//   return getBaseUrl();
// };

// // Check if the server is awake and ready to process requests
// export const checkServerStatus = async () => {
//   let attempts = 0;
//   const maxAttempts = CORS_PROXIES.length;
  
//   while (attempts < maxAttempts) {
//     try {
//       const BASE_URL = getBaseUrl();
//       console.log(`Checking server status using ${BASE_URL}...`);
      
//       const response = await fetch(`${BASE_URL}/`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         // Use no-cors mode as fallback if we're having CORS issues
//         mode: attempts > 0 ? "no-cors" : "cors"
//       });
      
//       // In no-cors mode, we can't access response details
//       if (attempts > 0 && response.type === 'opaque') {
//         console.log("Server check in no-cors mode completed");
//         return true;
//       }
      
//       if (response.ok) {
//         console.log("Server is up and running!");
//         return true;
//       } else {
//         console.log("Server responded but with an error:", response.status);
//         rotateProxy();
//         attempts++;
//       }
//     } catch (error) {
//       console.error("Server check failed:", error);
//       rotateProxy();
//       attempts++;
//     }
//   }
  
//   console.error("All server checks failed after trying all proxies");
//   return false;
// };

// // Create dummy data for fallback when server is unavailable
// const createFallbackData = () => {
//   return {
//     message: "Analysis could not be completed",
//     data: {
//       type: "Normal",
//       tone: 3,
//       acne: "Low"
//     }
//   };
// };

// export const UploadImage = async (imageSrc, navigate) => {
//   console.log("Preparing to upload image");
  
//   try {
//     // First check if server is responsive
//     const isServerUp = await checkServerStatus();
//     if (!isServerUp) {
//       console.warn("Server is not responding. Using fallback data.");
//       const fallbackData = createFallbackData();
//       localStorage.setItem('skinAnalysisData', JSON.stringify(fallbackData.data));
//       navigate("/form", { state: fallbackData });
//       throw new Error("Server is not responding. Using default values instead.");
//     }
    
//     console.log("Server is ready, uploading image...");
    
//     // Make sure the image data is properly formatted
//     let imageData = imageSrc;
//     // Check if the image already has a data URL prefix, if not add it
//     if (imageSrc && !imageSrc.startsWith('data:image/')) {
//       imageData = `data:image/jpeg;base64,${imageSrc}`;
//     }
    
//     // Try upload with each proxy if needed
//     let uploadSuccess = false;
//     let data = null;
//     let formattedData = null;
//     let attempts = 0;
//     const maxAttempts = CORS_PROXIES.length;
    
//     while (!uploadSuccess && attempts < maxAttempts) {
//       try {
//         const BASE_URL = getBaseUrl();
//         console.log(`Attempting upload using ${BASE_URL}...`);
        
//         const response = await fetch(`${BASE_URL}/upload`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ file: imageData }),
//         });

//         if (!response.ok) {
//           console.error("Server error:", response.status, response.statusText);
//           const errorText = await response.text();
//           throw new Error(`Server responded with status ${response.status}: ${errorText}`);
//         }

//         data = await response.json();
        
//         if (data.error) {
//           console.error("Upload Error:", data.error);
//           throw new Error(data.error);
//         }
        
//         console.log("Upload Success:", data);
//         uploadSuccess = true;
//       } catch (error) {
//         console.error(`Upload attempt ${attempts+1} failed:`, error);
//         rotateProxy();
//         attempts++;
        
//         // If this was our last attempt, use fallback
//         if (attempts >= maxAttempts) {
//           console.warn("All upload attempts failed. Using fallback data.");
//           data = createFallbackData();
//           uploadSuccess = true;
//         }
//       }
//     }
    
//     // Format the data properly for the form component
//     if (data.data) {
//       // New format with nested data object
//       formattedData = data;
//     } else if (data.type && data.tone && data.acne) {
//       // Old format with flat structure - restructure it
//       formattedData = {
//         message: "Analysis complete",
//         data: {
//           type: data.type,
//           tone: parseInt(data.tone || "3"), // Make sure tone is a number
//           acne: data.acne
//         }
//       };
//     } else {
//       // Unexpected format - use fallback
//       console.error("Unexpected data format from server:", data);
//       formattedData = createFallbackData();
//     }
    
//     // Save to localStorage as backup
//     if (formattedData.data) {
//       localStorage.setItem('skinAnalysisData', JSON.stringify(formattedData.data));
//     }
    
//     // Navigate to form with analysis data
//     navigate("/form", { state: formattedData });
    
//     return formattedData;
    
//   } catch (err) {
//     console.error("Error in UploadImage:", err);
    
//     // Don't throw if we've already navigated with fallback data
//     if (err.message !== "Server is not responding. Using default values instead.") {
//       throw err; // Re-throw for the component to handle
//     }
//   }
// };

// export const putForm = async (features, currType, currTone, navigate) => {
//   console.log("Submitting form with:", features, currType, currTone);
  
//   try {
//     // Try with each proxy if needed
//     let submitSuccess = false;
//     let data = null;
//     let attempts = 0;
//     const maxAttempts = CORS_PROXIES.length;
    
//     while (!submitSuccess && attempts < maxAttempts) {
//       try {
//         const BASE_URL = getBaseUrl();
//         console.log(`Attempting form submission using ${BASE_URL}...`);
        
//         const response = await fetch(`${BASE_URL}/recommend`, {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             features: features,
//             type: currType,
//             tone: currTone,
//           }),
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(`Server responded with status ${response.status}: ${errorText}`);
//         }

//         data = await response.json();
        
//         if (data.error) {
//           console.error("Form submission error:", data.error);
//           throw new Error(data.error);
//         }
        
//         submitSuccess = true;
//       } catch (error) {
//         console.error(`Form submission attempt ${attempts+1} failed:`, error);
//         rotateProxy();
//         attempts++;
        
//         // If this was our last attempt, use fallback
//         if (attempts >= maxAttempts) {
//           console.warn("All submission attempts failed. Using fallback data.");
//           // Create dummy recommendation data
//           data = {
//             general: ["Cleanser", "Moisturizer", "Sunscreen"],
//             makeup: ["Foundation", "Concealer"]
//           };
//           submitSuccess = true;
//         }
//       }
//     }
    
//     navigate("/recs", { state: { data } });
//     console.log("Form submission success:", data);
//     return data;
    
//   } catch (err) {
//     console.error("Error in putForm:", err);
//     throw err; // Re-throw for the component to handle
//   }
// };



// BASE URL of your backend on Render
// Try multiple CORS proxies in case one fails
const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://cors-anywhere.herokuapp.com/",
  "" // No proxy as fallback
];
const BACKEND_URL = "https://sayskin-backend.onrender.com";
let currentProxyIndex = 0;

// Helper to get the current BASE_URL with proxy
const getBaseUrl = () => {
  return CORS_PROXIES[currentProxyIndex] + BACKEND_URL;
};

// Try another proxy if the current one fails
const rotateProxy = () => {
  currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
  console.log(`Switching to proxy: ${CORS_PROXIES[currentProxyIndex]}`);
  return getBaseUrl();
};

// Create dummy data for fallback when server is unavailable
const createFallbackData = () => {
  return {
    message: "Analysis could not be completed due to connection issues",
    data: {
      type: "Normal",
      tone: 3,
      acne: "Low"
    }
  };
};

// Generate personalized recommendations based on skin characteristics
const generateRecommendations = (skinType, skinTone, features) => {
  // Default recommendations for all skin types
  const generalRecs = [
    "Gentle Cleanser",
    "Sunscreen SPF 30+",
    "Hydrating Moisturizer"
  ];
  
  // Type-specific recommendations
  let typeRecs = [];
  
  if (skinType === "Oily" || features.oily === 1) {
    typeRecs = [
      "Oil-Free Moisturizer",
      "Salicylic Acid Cleanser",
      "Clay Mask (weekly)",
      "Niacinamide Serum"
    ];
  } else if (skinType === "Dry" || features.dry === 1) {
    typeRecs = [
      "Rich Moisturizer with Ceramides",
      "Hydrating Toner",
      "Hyaluronic Acid Serum",
      "Overnight Mask (weekly)"
    ];
  } else if (skinType === "Normal") {
    typeRecs = [
      "Balanced Moisturizer",
      "Vitamin C Serum",
      "Gentle Exfoliant (weekly)"
    ];
  }
  
  // Concern-specific recommendations
  let concernRecs = [];
  
  if (features.acne === 1) {
    concernRecs.push("Benzoyl Peroxide Spot Treatment", "Tea Tree Oil Products");
  }
  
  if (features.sensitive === 1) {
    concernRecs.push("Fragrance-Free Products", "Centella Asiatica Soothing Cream");
  }
  
  if (features["fine lines"] === 1 || features.wrinkles === 1) {
    concernRecs.push("Retinol Serum", "Peptide Cream");
  }
  
  if (features.pigmentation === 1 || features["dark spots"] === 1) {
    concernRecs.push("Vitamin C Serum", "Alpha Arbutin Treatment", "Exfoliating Toner");
  }
  
  // Makeup recommendations based on skin tone
  let makeupRecs = [];
  
  if (skinTone <= 2) {
    makeupRecs = ["Light Coverage Foundation", "Fair Concealer", "Cool Tone Blush"];
  } else if (skinTone <= 4) {
    makeupRecs = ["Medium Coverage Foundation", "Medium Concealer", "Neutral Tone Blush"];
  } else {
    makeupRecs = ["Full Coverage Foundation", "Deep Concealer", "Warm Tone Blush"];
  }
  
  return {
    general: [...new Set([...generalRecs, ...typeRecs, ...concernRecs])],
    makeup: makeupRecs
  };
};

// Simplified check to see if the server is reachable
export const checkServerStatus = async () => {
  let attempts = 0;
  const maxAttempts = CORS_PROXIES.length;
  
  while (attempts < maxAttempts) {
    try {
      const BASE_URL = getBaseUrl();
      console.log(`Checking server status using ${BASE_URL}...`);
      
      const response = await fetch(`${BASE_URL}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Use no-cors mode as fallback if we're having CORS issues
        mode: attempts > 0 ? "no-cors" : "cors"
      });
      
      // In no-cors mode, we can't access response details
      if (attempts > 0 && response.type === 'opaque') {
        console.log("Server check in no-cors mode completed");
        return true;
      }
      
      if (response.ok) {
        console.log("Server is up and running!");
        return true;
      } else {
        console.log("Server responded but with an error:", response.status);
        rotateProxy();
        attempts++;
      }
    } catch (error) {
      console.error("Server check failed:", error);
      rotateProxy();
      attempts++;
    }
  }
  
  console.error("All server checks failed after trying all proxies");
  return false;
};

export const UploadImage = async (imageSrc, navigate) => {
  console.log("Preparing to process image");
  
  try {
    // Make sure the image data is properly formatted for logging
    let imageData = imageSrc;
    if (imageSrc && !imageSrc.startsWith('data:image/')) {
      imageData = `data:image/jpeg;base64,${imageSrc}`;
    }
    
    // Log image details for debugging
    console.log("Image data format:", {
      length: imageSrc ? imageSrc.length : 0,
      hasDataPrefix: imageSrc ? imageSrc.startsWith('data:') : false
    });
    
    // Try a quick server check first
    const serverCheckPromise = checkServerStatus();
    
    // Set a timeout to use fallback data if server check takes too long
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve('timeout');
      }, 3000); // 3 seconds timeout
    });
    
    // Race the server check against the timeout
    const result = await Promise.race([serverCheckPromise, timeoutPromise]);
    
    // If we got a timeout or server is not up, use fallback immediately
    if (result === 'timeout' || result === false) {
      console.warn("Using fallback data due to server connection issues");
      const fallbackData = createFallbackData();
      localStorage.setItem('skinAnalysisData', JSON.stringify(fallbackData.data));
      navigate("/form", { state: fallbackData });
      return fallbackData;
    }
    
    console.log("Server appears reachable, attempting upload...");
    
    // Try upload with each proxy
    let uploadSuccess = false;
    let data = null;
    let formattedData = null;
    let attempts = 0;
    const maxAttempts = CORS_PROXIES.length;
    
    while (!uploadSuccess && attempts < maxAttempts) {
      try {
        const BASE_URL = getBaseUrl();
        console.log(`Attempting upload using ${BASE_URL}...`);
        
        const response = await fetch(`${BASE_URL}/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ file: imageData }),
        });

        if (!response.ok) {
          console.error("Server error:", response.status, response.statusText);
          throw new Error(`Server responded with status ${response.status}`);
        }

        data = await response.json();
        
        if (data.error) {
          console.error("Upload Error:", data.error);
          throw new Error(data.error);
        }
        
        console.log("Upload Success:", data);
        uploadSuccess = true;
      } catch (error) {
        console.error(`Upload attempt ${attempts+1} failed:`, error);
        rotateProxy();
        attempts++;
        
        // If this was our last attempt, use fallback
        if (attempts >= maxAttempts) {
          console.warn("All upload attempts failed. Using fallback data.");
          data = createFallbackData();
          uploadSuccess = true;
        }
      }
    }
    
    // Format the data properly for the form component
    if (data.data) {
      // New format with nested data object
      formattedData = data;
    } else if (data.type && data.tone && data.acne) {
      // Old format with flat structure - restructure it
      formattedData = {
        message: "Analysis complete",
        data: {
          type: data.type,
          tone: parseInt(data.tone || "3"), // Make sure tone is a number
          acne: data.acne
        }
      };
    } else {
      // Unexpected format - use fallback
      console.error("Unexpected data format from server:", data);
      formattedData = createFallbackData();
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
    
    // Use fallback data if we haven't already
    const fallbackData = createFallbackData();
    localStorage.setItem('skinAnalysisData', JSON.stringify(fallbackData.data));
    navigate("/form", { state: fallbackData });
    
    return fallbackData;
  }
};

export const putForm = async (features, currType, currTone, navigate) => {
  console.log("Submitting form with:", features, currType, currTone);
  
  try {
    // Set a timeout for the server request
    const serverRequestPromise = async () => {
      // Try with each proxy if needed
      let submitSuccess = false;
      let data = null;
      let attempts = 0;
      const maxAttempts = CORS_PROXIES.length;
      
      while (!submitSuccess && attempts < maxAttempts) {
        try {
          const BASE_URL = getBaseUrl();
          console.log(`Attempting form submission using ${BASE_URL}...`);
          
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
            throw new Error(`Server responded with status ${response.status}`);
          }

          data = await response.json();
          
          if (data.error) {
            console.error("Form submission error:", data.error);
            throw new Error(data.error);
          }
          
          submitSuccess = true;
          return data;
        } catch (error) {
          console.error(`Form submission attempt ${attempts+1} failed:`, error);
          rotateProxy();
          attempts++;
          
          if (attempts >= maxAttempts) {
            throw new Error("All submission attempts failed");
          }
        }
      }
    };
    
    // Set a timeout to use generated recommendations if server request takes too long
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve('timeout');
      }, 3000); // 3 seconds timeout
    });
    
    // Race the server request against the timeout
    const result = await Promise.race([serverRequestPromise(), timeoutPromise]);
    
    let data;
    if (result === 'timeout') {
      console.warn("Server request timed out. Using generated recommendations.");
      data = generateRecommendations(currType, currTone, features);
    } else {
      data = result;
    }
    
    navigate("/recs", { state: { data } });
    console.log("Form submission success:", data);
    return data;
    
  } catch (err) {
    console.error("Error in putForm:", err);
    
    // Generate recommendations as fallback
    console.warn("Generating recommendations locally due to server error");
    const recommendations = generateRecommendations(currType, currTone, features);
    
    navigate("/recs", { state: { data: recommendations } });
    return recommendations;
  }
};
