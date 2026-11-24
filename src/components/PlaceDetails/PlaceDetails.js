import React, { useEffect } from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Chip } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PhoneIcon from '@material-ui/icons/Phone';
import DirectionsIcon from '@material-ui/icons/Directions';
import Rating from '@material-ui/lab/Rating';

import useStyles from './styles';

const PLACEHOLDER_IMAGE = 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg';

// Google Maps URLs open directions in Google Maps (app or web). No API key or billing needed.
const directionsUrl = (place) => `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

const openInNewTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');

const PlaceDetails = ({ place, selected, refProp }) => {
  const classes = useStyles();

  // Scrolling is a side effect, so it belongs in useEffect rather than in render.
  useEffect(() => {
    if (selected) refProp?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selected, refProp]);

  return (
    <Card elevation={6} className={selected ? classes.selected : undefined}>
      <CardMedia
        style={{ height: 350 }}
        image={place.photo ? place.photo.images.large.url : PLACEHOLDER_IMAGE}
        title={place.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5">{place.name}</Typography>
        <Box display="flex" justifyContent="space-between" my={2}>
          <Rating name="read-only" value={Number(place.rating)} precision={0.5} readOnly />
          <Typography component="legend">
            {place.num_reviews} review{place.num_reviews > 1 ? 's' : ''}
          </Typography>
        </Box>
        {place.price_level && (
          <Box display="flex" justifyContent="space-between">
            <Typography component="legend">Price</Typography>
            <Typography gutterBottom variant="subtitle1">{place.price_level}</Typography>
          </Box>
        )}
        {place.ranking && (
          <Box display="flex" justifyContent="space-between">
            <Typography component="legend">Ranking</Typography>
            <Typography gutterBottom variant="subtitle1">{place.ranking}</Typography>
          </Box>
        )}
        {place.awards?.map((award) => (
          <Box key={award.display_name} display="flex" justifyContent="space-between" my={1} alignItems="center">
            <img src={award.images.small} alt="" />
            <Typography variant="subtitle2" color="textSecondary">{award.display_name}</Typography>
          </Box>
        ))}
        {place.cuisine?.map(({ name }) => (
          <Chip key={name} size="small" label={name} className={classes.chip} />
        ))}
        {place.address && (
          <Typography gutterBottom variant="body2" color="textSecondary" className={classes.subtitle}>
            <LocationOnIcon />
            {place.address}
          </Typography>
        )}
        {place.phone && (
          <Typography variant="body2" color="textSecondary" className={classes.spacing}>
            <PhoneIcon />
            {place.phone}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        {place.latitude && place.longitude && (
          <Button size="small" color="primary" startIcon={<DirectionsIcon />} onClick={() => openInNewTab(directionsUrl(place))}>
            Directions
          </Button>
        )}
        {place.web_url && (
          <Button size="small" color="primary" onClick={() => openInNewTab(place.web_url)}>
            Trip Advisor
          </Button>
        )}
        {place.website && (
          <Button size="small" color="primary" onClick={() => openInNewTab(place.website)}>
            Website
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default PlaceDetails;
