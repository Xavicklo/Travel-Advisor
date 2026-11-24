import React, { useEffect } from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DirectionsIcon from '@material-ui/icons/Directions';
import MapIcon from '@material-ui/icons/Map';
import Rating from '@material-ui/lab/Rating';

import useStyles from './styles';

const PLACEHOLDER_IMAGE = 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg';

// Google Maps URLs open Google Maps (app or web). No API key or billing needed.
const directionsUrl = (place) => `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${place.id}`;

const openInNewTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');

const PlaceDetails = ({ place, selected, refProp }) => {
  const classes = useStyles();

  // Scrolling is a side effect, so it belongs in useEffect rather than in render.
  useEffect(() => {
    if (selected) refProp?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selected, refProp]);

  return (
    <Card elevation={6} className={selected ? classes.selected : undefined}>
      <CardMedia style={{ height: 250 }} image={place.photoUrl || PLACEHOLDER_IMAGE} title={place.name} />
      <CardContent>
        <Typography gutterBottom variant="h5">{place.name}</Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <Box display="flex" alignItems="center">
            <Rating name="read-only" value={place.rating || 0} precision={0.5} readOnly />
            <Typography variant="body2" style={{ marginLeft: 6 }}>{place.rating ?? '–'}</Typography>
          </Box>
          <Typography component="legend">
            {place.reviews.toLocaleString()} 則評論
          </Typography>
        </Box>
        {place.priceLevel && (
          <Box display="flex" justifyContent="space-between">
            <Typography component="legend">價位</Typography>
            <Typography gutterBottom variant="subtitle1">{place.priceLevel}</Typography>
          </Box>
        )}
        {place.address && (
          <Typography gutterBottom variant="body2" color="textSecondary" className={classes.subtitle}>
            <LocationOnIcon />
            {place.address}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" startIcon={<DirectionsIcon />} onClick={() => openInNewTab(directionsUrl(place))}>
          導航
        </Button>
        <Button size="small" color="primary" startIcon={<MapIcon />} onClick={() => openInNewTab(place.mapsUrl)}>
          在 Google 地圖開啟
        </Button>
      </CardActions>
    </Card>
  );
};

export default PlaceDetails;
