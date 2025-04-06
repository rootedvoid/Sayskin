export const UploadImage = (imageSrc, navigate) => {
  fetch("http://localhost:5000/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: imageSrc }), // Sending base64 string directly
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        console.log("Upload Error:", data.error);
      } else {
        navigate("/form", { state: { data } });
        console.log("Upload Success:", data);
      }
    })
    .catch((err) => {
      console.log("Fetch Error:", err.message);
    });
};

export const putForm = (features, currType, currTone, navigate) => {
  console.log("Submitting form with:", features, currType, currTone);
  fetch("http://localhost:5000/recommend", {
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
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        console.log("Form submission error:", data.error);
      } else {
        navigate("/recs", { state: { data } });
        console.log("Form submission success:", data);
      }
    })
    .catch((err) => {
      console.log("Fetch Error:", err.message);
    });
};
