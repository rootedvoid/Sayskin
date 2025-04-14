// import React,{useState} from 'react';
// import { UploadImage } from '../controllers/actions'
// import {useNavigate} from 'react-router-dom';

// import WebcamCapture from './Components/webCam'

// // MUI
// import Grid from '@mui/material/Grid';
// import Container from '@mui/material/Container';
// import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
// import Button from '@mui/material/Button';

// function ImageInput() {
//     const [landingPage, setLandingPage] = useState(true)
//     const [imageSrc, setImageSrc] = useState(null)
//     const navigate = useNavigate();
//     if(imageSrc !== null) {
//         console.log("we got an image")
//         UploadImage(imageSrc, navigate)
//     }

//     return (
//         <>
//             <Container maxWidth="xs" sx={{padding: 0}} alignitems="center">
//                 <Grid container justify="center" sx={{maxHeight:"100vh"}} spacing={1}>
//                     {landingPage ? 
//                         <Grid item xs={6} sx={{margin:"40vh auto"}} textAlign="center">
//                             <PhotoCameraIcon sx={{fontSize:"5em"}}/>    
//                             <Button 
//                                 onClick={() => {setLandingPage(false)}} 
//                                 variant="contained"
//                                 fullWidth>
//                                 Take a photo
//                             </Button>
//                         </Grid>:
//                         <WebcamCapture setImageSrc={setImageSrc}/>
//                     }
//                 </Grid>   
//             </Container>
//         </>
//     )
// }

// export default ImageInput


import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const ImageCapture = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Please select or capture an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      console.log('Analysis result:', result);

      // Save to localStorage for fallback
      if (result.data) {
        localStorage.setItem('skinAnalysisData', JSON.stringify(result.data));
      }

      // Navigate to form page with analysis results
      navigate('/form', { state: result });
    } catch (err) {
      console.error('Error during analysis:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Skin Analysis
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box 
          sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 2, 
            p: 2, 
            mb: 3,
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
