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


import React, { useState } from 'react';
import { UploadImage } from '../controllers/actions';
import { useNavigate } from 'react-router-dom';
import WebcamCapture from './Components/webCam';
// MUI
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';

function ImageInput() {
    const [landingPage, setLandingPage] = useState(true);
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Handle image upload and analysis
    const handleImageUpload = async (imageData) => {
        if (!imageData) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // Call your existing upload function (you may need to modify the UploadImage function)
            const result = await UploadImage(imageData, navigate);
            
            // If UploadImage doesn't already handle navigation, do it here
            if (result && result.data) {
                // Save to localStorage as backup
                localStorage.setItem('skinAnalysisData', JSON.stringify(result.data));
                
                // Navigate to form with data
                navigate('/form', { state: result });
            }
        } catch (err) {
            console.error("Error during image analysis:", err);
            setError("Failed to analyze image. Please try again.");
            setLandingPage(true); // Go back to landing page on error
        } finally {
            setLoading(false);
        }
    };

    // Watch for image capture and process it
    React.useEffect(() => {
        if (imageSrc !== null) {
            console.log("Image captured, starting analysis");
            handleImageUpload(imageSrc);
        }
    }, [imageSrc]);

    return (
        <>
            <Container maxWidth="xs" sx={{ padding: 0 }} alignitems="center">
                <Grid container justify="center" sx={{ maxHeight: "100vh" }} spacing={1}>
                    {loading ? (
                        <Grid item xs={12} sx={{ margin: "40vh auto", textAlign: "center" }}>
                            <CircularProgress size={60} />
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                Analyzing your skin...
                            </Typography>
                        </Grid>
                    ) : landingPage ? (
                        <Grid item xs={6} sx={{ margin: "40vh auto" }} textAlign="center">
                            <PhotoCameraIcon sx={{ fontSize: "5em" }} />
                            <Button
                                onClick={() => { setLandingPage(false) }}
                                variant="contained"
                                fullWidth>
                                Take a photo
                            </Button>
                        </Grid>
                    ) : (
                        <WebcamCapture setImageSrc={setImageSrc} />
                    )}
                </Grid>
            </Container>

            <Snackbar
                open={error !== null}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setError(null)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}

export default ImageInput;
