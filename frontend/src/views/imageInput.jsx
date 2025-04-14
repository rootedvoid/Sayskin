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


import React, { useState, useEffect } from 'react';
import { UploadImage, checkServerStatus } from '../controllers/actions';
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
    const [serverLoading, setServerLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const navigate = useNavigate();

    // Check server status when component loads
    useEffect(() => {
        const wakeUpServer = async () => {
            setServerLoading(true);
            try {
                await checkServerStatus();
                console.log("Server status checked");
            } catch (err) {
                console.log("Server might be starting up...");
            } finally {
                setServerLoading(false);
            }
        };
        
        wakeUpServer();
    }, []);

    // Watch for image capture and process it
    useEffect(() => {
        if (imageSrc !== null) {
            console.log("Image captured, starting analysis");
            processImage();
        }
    }, [imageSrc, retryCount]);

    const processImage = async () => {
        if (!imageSrc) return;
        
        setLoading(true);
        setError(null);
        
        try {
            await UploadImage(imageSrc, navigate);
        } catch (err) {
            console.error("Error during analysis:", err);
            
            // Check if it's a server not responsive error
            if (err.message && err.message.includes("Server is not responding")) {
                setError("Server is starting up. This may take a moment on free tier hosting. Please wait...");
                
                // If we haven't tried too many times, set up to retry
                if (retryCount < 3) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, 5000); // Wait 5 seconds before retry
                } else {
                    setError("Server is taking too long to respond. Please try again later.");
                    setLandingPage(true);
                }
            } else {
                setError(`Failed to analyze image: ${err.message || "Unknown error"}`);
                setLandingPage(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setRetryCount(0);
        processImage();
    };

    return (
        <>
            <Container maxWidth="xs" sx={{ padding: 0 }} alignitems="center">
                <Grid container justify="center" sx={{ maxHeight: "100vh" }} spacing={1}>
                    {loading || serverLoading ? (
                        <Grid item xs={12} sx={{ margin: "40vh auto", textAlign: "center" }}>
                            <CircularProgress size={60} />
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                {serverLoading ? "Connecting to server..." : "Analyzing your skin..."}
                            </Typography>
                            {loading && retryCount > 0 && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Retry attempt {retryCount}/3...
                                </Typography>
                            )}
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
                    action={
                        error && error.includes("Server is starting up") ? (
                            <Button color="inherit" size="small" onClick={handleRetry}>
                                RETRY
                            </Button>
                        ) : null
                    }
                >
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}

export default ImageInput;
