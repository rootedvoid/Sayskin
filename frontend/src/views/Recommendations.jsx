import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';
import ProductCard from './Components/ProductCard';
import { useLocation } from 'react-router';

const Recommendations = () => {
  const { state } = useLocation();
  const { imageBase64 } = state; // Make sure you're passing this from previous page

  const [general, setGeneral] = useState({});
  const [makeup, setMakeup] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("https://sayskin.onrender.com/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ image: imageBase64 })
        });

        const data = await response.json();
        console.log("Received from backend:", data);

        // Assuming backend returns: { general: {...}, makeup: [...] }
        setGeneral(data.general || {});
        setMakeup(data.makeup || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [imageBase64]);

  if (loading) {
    return (
      <Container sx={{ marginTop: "4vh", textAlign: "center" }}>
        <Typography variant="h5" color="primary">Analyzing your skin... please wait ⏳</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ marginTop: "2vh", padding: 1 }} alignitems="center" width="inherit">
      <Typography gutterBottom variant="h4" component="div" marginTop="2vh" textAlign="center">
        Skin care
      </Typography>

      {Object.keys(general).map((type) => (
        <div key={type}>
          <Typography gutterBottom variant="h5" component="div" marginTop="2vh" color="text.secondary">
            {type}
          </Typography>
          <Grid container spacing={1}>
            {general[type]?.slice(0, 4).map((prod, index) => (
              <Grid item xs={6} md={3} key={index}>
                <ProductCard
                  name={prod.name}
                  brand={prod.brand}
                  image={prod.img}
                  price={prod.price}
                  url={prod.url}
                  concern={prod.concern}
                />
              </Grid>
            ))}
          </Grid>
        </div>
      ))}

      <Typography gutterBottom variant="h4" component="div" marginTop="2vh" textAlign="center">
        Make up
      </Typography>

      <div>
        <Grid container spacing={1}>
          {makeup.map((prod, index) => (
            <Grid item xs={6} md={3} key={index}>
              <ProductCard
                name={prod.name}
                brand={prod.brand}
                image={prod.img}
                price={prod.price}
                url={prod.url}
                concern={prod.concern}
              />
            </Grid>
          ))}
        </Grid>
      </div>
    </Container>
  );
};

export default Recommendations;  
