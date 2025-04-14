import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

// MUI
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// controllers
import { putForm } from '../controllers/actions';

const skinToneValues = [1, 2, 3, 4, 5, 6];
const skinToneColors = [
  "rgb(249, 245, 236)",
  "rgb(250, 245, 234)",
  "rgb(240, 227, 171)",
  "rgb(206, 172, 104)",
  "rgb(105, 59, 41)",
  "rgb(33, 28, 40)",
];

const skinTypes = ["All", "Oily", "Normal", "Dry"];
const acnes = ['Low', 'Moderate', 'Severe'];
const otherConcerns = [
  'sensitive', 'fine lines', 'wrinkles', 'redness', 'pore', 'pigmentation',
  'blackheads', 'whiteheads', 'blemishes', 'dark circles', 'eye bags', 'dark spots'
];

const Form = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [currType, setCurrType] = useState("Oily");
  const [currTone, setCurrTone] = useState(5);
  const [currAcne, setAcne] = useState("Moderate");
  const [features, setFeatures] = useState({
    "normal": false, "dry": false, "oily": false, "combination": false,
    "acne": false, "sensitive": false, "fine lines": false, "wrinkles": false,
    "redness": false, "dull": false, "pore": false, "pigmentation": false,
    "blackheads": false, "whiteheads": false, "blemishes": false, "dark circles": false,
    "eye bags": false, "dark spots": false
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Autofill from ML model predictions (received via state or localStorage)
  useEffect(() => {
    // First try to get data from router state
    if (state && state.data) {
      console.log("Received analysis data from router state:", state.data);
      const { tone, type, acne } = state.data;
      if (tone) setCurrTone(parseInt(tone));
      if (type) setCurrType(type);
      if (acne) setAcne(acne);
      setNotification({
        open: true,
        message: 'Form auto-filled with your skin analysis results!',
        severity: 'success'
      });
    } 
    // Then try localStorage as fallback
    else {
      try {
        const savedData = localStorage.getItem('skinAnalysisData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log("Loaded analysis data from localStorage:", parsedData);
          if (parsedData.tone) setCurrTone(parseInt(parsedData.tone));
          if (parsedData.type) setCurrType(parsedData.type);
          if (parsedData.acne) setAcne(parsedData.acne);
          setNotification({
            open: true,
            message: 'Loaded your previous skin analysis results',
            severity: 'info'
          });
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
    }
  }, [state]);

  // Direct API fetch method (alternative approach)
  const fetchAnalysisData = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const result = await response.json();
      if (result.data) {
        const { tone, type, acne } = result.data;
        if (tone) setCurrTone(parseInt(tone));
        if (type) setCurrType(type);
        if (acne) setAcne(acne);
        
        // Save to localStorage for persistence
        localStorage.setItem('skinAnalysisData', JSON.stringify(result.data));
        
        setNotification({
          open: true,
          message: 'Skin analysis completed successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      setNotification({
        open: true,
        message: 'Failed to analyze skin image',
        severity: 'error'
      });
    }
  };

  const handleChange = (event) => {
    setFeatures({
      ...features,
      [event.target.name]: event.target.checked,
    });
  };

  const handleTone = (e) => setCurrTone(parseInt(e.target.value));
  const handleType = (e) => setCurrType(e.target.value);
  const handleAcne = (e) => setAcne(e.target.value);
  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  const handleSubmit = () => {
    const updatedFeatures = { ...features };

    if (currType === 'All') {
      updatedFeatures['normal'] = true;
      updatedFeatures['dry'] = true;
      updatedFeatures['oily'] = true;
      updatedFeatures['combination'] = true;
    } else {
      updatedFeatures[currType.toLowerCase()] = true;
    }

    if (currAcne !== "Low") {
      updatedFeatures['acne'] = true;
    }

    for (const key in updatedFeatures) {
      updatedFeatures[key] = updatedFeatures[key] ? 1 : 0;
    }

    // Save current analysis to localStorage
    const analysisData = { type: currType, tone: currTone, acne: currAcne };
    localStorage.setItem('skinAnalysisData', JSON.stringify(analysisData));

    console.log({ features: updatedFeatures, type: currType, tone: currTone });
    putForm(updatedFeatures, currType, currTone, navigate);
  };

  return (
    <Container maxWidth="xs" sx={{ marginTop: "2vh" }} alignitems="center">
      <Typography variant="h5" component="div" textAlign="center">
        Skin Analysis Results
      </Typography>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <FormControl component="fieldset" sx={{ marginTop: "3vh" }}>
        <Grid container spacing={2}>
          <Grid item xs={9}>
            <InputLabel id="tone-select-label">Skin Tone</InputLabel>
            <Select
              labelId="tone-select-label"
              id="tone-select"
              value={currTone}
              onChange={handleTone}
              fullWidth
            >
              {skinToneValues.map((value) => (
                <MenuItem key={value} value={value}>{value}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={3}>
            <div
              style={{
                height: "3rem",
                width: "3rem",
                backgroundColor: skinToneColors[currTone - 1],
                margin: "0 auto",
                borderRadius: "10%",
              }}
            />
          </Grid>
        </Grid>

        <Grid marginTop="2vh">
          <FormLabel component="legend">Skin Type</FormLabel>
          <RadioGroup
            row
            name="skin-type-group"
            value={currType}
            onChange={handleType}
          >
            <Grid container>
              {skinTypes.map((type) => (
                <Grid item xs={6} key={type}>
                  <FormControlLabel value={type} control={<Radio />} label={type} />
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </Grid>

        <Grid marginTop="2vh">
          <FormLabel component="legend">Acne Severity</FormLabel>
          <RadioGroup
            row
            name="acne-group"
            value={currAcne}
            onChange={handleAcne}
          >
            <Grid container>
              {acnes.map((ac) => (
                <Grid item key={ac}>
                  <FormControlLabel value={ac} control={<Radio />} label={ac} />
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </Grid>

        <Grid marginTop="2vh">
          <FormLabel component="legend">Other Skin Concerns</FormLabel>
          <Grid container>
            {otherConcerns.map((concern) => (
              <Grid item xs={6} key={concern}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={features[concern]}
                      onChange={handleChange}
                      name={concern}
                    />
                  }
                  label={concern.charAt(0).toUpperCase() + concern.slice(1)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid marginTop="2vh" item xs={12}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            fullWidth
            color="primary"
          >
            Get Recommendations
          </Button>
        </Grid>
      </FormControl>
    </Container>
  );
};

export default Form;
