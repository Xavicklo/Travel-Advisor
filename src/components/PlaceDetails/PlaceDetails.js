import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Chip, Avatar, Collapse, CircularProgress, Link, IconButton,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import RoomIcon from '@material-ui/icons/Room';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DirectionsIcon from '@material-ui/icons/Directions';
import RateReviewIcon from '@material-ui/icons/RateReview';
import PhoneIcon from '@material-ui/icons/Phone';
import LanguageIcon from '@material-ui/icons/Language';
import NearMeIcon from '@material-ui/icons/NearMe';
import Rating from '@material-ui/lab/Rating';

import { getKind } from '../../utils/categories';
import { formatDistance } from '../../utils/geo';
import useStyles from './styles';

const PLACEHOLDER_IMAGE = 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg';

// Google Maps URLs open Google Maps (app or web). No API key or billing needed.
const directionsUrl = (place) => `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${place.id}`;

const openInNewTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');

/** Small coloured label with the category icon, e.g. 🍴 餐廳 */
const CategoryChip = ({ kind }) => {
  const { Icon, label, color } = getKind(kind);
  return (
    <Chip size="small" icon={<Icon style={{ color: '#fff' }} />} label={label} style={{ backgroundColor: color, color: '#fff' }} />
  );
};

const PlaceDetails = ({ place, selected, refProp, loadDetails, isFavorite = false, onToggleFavorite, onShowOnMap }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [detailsError, setDetailsError] = useState('');
  const [loading, setLoading] = useState(false);

  // Scrolling is a side effect, so it belongs in useEffect rather than in render.
  useEffect(() => {
    if (selected) refProp?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selected, refProp]);

  // Reviews are fetched only the first time the user opens them (Place Details is billed).
  const toggleReviews = () => {
    const next = !open;
    setOpen(next);
    if (next && !details && !loading) {
      setLoading(true);
      setDetailsError('');
      loadDetails(place.id)
        .then(setDetails)
        .catch((err) => setDetailsError(err.message))
        .finally(() => setLoading(false));
    }
  };

  return (
    <Card elevation={6} className={`${classes.card} ${selected ? classes.selected : ''}`}>
      <CardMedia style={{ height: 220 }} image={place.photoUrl || PLACEHOLDER_IMAGE} title={place.name} />
      {onToggleFavorite && (
        <IconButton
          className={classes.favButton}
          aria-label={isFavorite ? '取消收藏' : '加入收藏'}
          title={isFavorite ? '取消收藏' : '加入收藏'}
          onClick={() => onToggleFavorite(place)}
        >
          {isFavorite ? <FavoriteIcon style={{ color: '#e53935' }} /> : <FavoriteBorderIcon />}
        </IconButton>
      )}
      <CardContent>
        <Typography gutterBottom variant="h5">{place.name}</Typography>
        <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
          <CategoryChip kind={place.kind} />
          {place.distanceKm != null && (
            <Chip size="small" variant="outlined" icon={<NearMeIcon />} label={`距離 ${formatDistance(place.distanceKm)}`} />
          )}
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <Box display="flex" alignItems="center">
            <Rating name="read-only" value={place.rating || 0} precision={0.5} readOnly />
            <Typography variant="body2" style={{ marginLeft: 6, fontWeight: 600 }}>{place.rating ?? '–'}</Typography>
          </Box>
          <Typography component="legend">{place.reviews.toLocaleString()} 則評論</Typography>
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
        <Button size="small" color="primary" startIcon={<RateReviewIcon />} onClick={toggleReviews}>
          {open ? '收起評論' : '查看評論'}
        </Button>
        <Button size="small" color="primary" startIcon={<DirectionsIcon />} onClick={() => openInNewTab(directionsUrl(place))}>
          導航
        </Button>
        {onShowOnMap && (
          <Button size="small" color="primary" startIcon={<RoomIcon />} onClick={() => onShowOnMap(place)}>
            在地圖上看
          </Button>
        )}
      </CardActions>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <CardContent className={classes.reviewsBox}>
          {loading && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={28} />
            </Box>
          )}
          {detailsError && <Typography color="error" variant="body2">{detailsError}</Typography>}
          {details && (
            <>
              {(details.phone || details.website) && (
                <Box display="flex" flexWrap="wrap" mb={1.5} style={{ gap: 16 }}>
                  {details.phone && (
                    <Link href={`tel:${details.phone}`} className={classes.contact}>
                      <PhoneIcon fontSize="small" />
                      {details.phone}
                    </Link>
                  )}
                  {details.website && (
                    <Link href={details.website} target="_blank" rel="noopener noreferrer" className={classes.contact}>
                      <LanguageIcon fontSize="small" />
                      官方網站
                    </Link>
                  )}
                </Box>
              )}
              {details.reviews.length === 0 && <Typography variant="body2" color="textSecondary">目前沒有評論。</Typography>}
              {details.reviews.map((review) => (
                <div key={`${review.author}-${review.when}`} className={classes.review}>
                  <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                    <Avatar src={review.avatar} alt="" className={classes.avatar} />
                    <div>
                      <Typography variant="subtitle2">{review.author}</Typography>
                      <Box display="flex" alignItems="center" style={{ gap: 6 }}>
                        <Rating value={review.rating} size="small" readOnly />
                        <Typography variant="caption" color="textSecondary">{review.when}</Typography>
                      </Box>
                    </div>
                  </Box>
                  {review.text && <Typography variant="body2" className={classes.reviewText}>{review.text}</Typography>}
                </div>
              ))}
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => openInNewTab(details.url || place.mapsUrl)}
              >
                在 Google 地圖看全部 {place.reviews.toLocaleString()} 則評論
              </Button>
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default PlaceDetails;
