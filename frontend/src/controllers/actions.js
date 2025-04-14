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


// BASE URL of your backend on Render
const BASE_URL = "https://sayskin-backend.onrender.com";

export const UploadImage = (imageSrc, navigate) => {
  console.log("Uploading image for analysis");
  
  return fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: imageSrc }), // Assuming backend expects "file"
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        console.log("Upload Error:", data.error);
        throw new Error(data.error);
      } else {
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
      }
    })
    .catch((err) => {
      console.log("Fetch Error:", err.message);
      throw err; // Re-throw for the component to handle
    });
};

export const putForm = (features, currType, currTone, navigate) => {
  console.log("Submitting form with:", features, currType, currTone);
  
  return fetch(`${BASE_URL}/recommend`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      features: features,
      type: currType,
      tone: currTone,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        console.log("Form submission error:", data.error);
        throw new Error(data.error);
      } else {
        navigate("/recs", { state: { data } });
        console.log("Form submission success:", data);
        return data;
      }
    })
    .catch((err) => {
      console.log("Fetch Error:", err.message);
      throw err; // Re-throw for the component to handle
    });
};
