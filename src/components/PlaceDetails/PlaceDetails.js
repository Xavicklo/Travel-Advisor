import React, { useEffect, useState } from 'react';
import {
  Typography, Button, Avatar, CircularProgress, IconButton, ButtonBase, Divider,
} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import DirectionsIcon from '@material-ui/icons/Directions';
import PhoneIcon from '@material-ui/icons/Phone';
import LanguageIcon from '@material-ui/icons/Language';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Rating from '@material-ui/lab/Rating';

import { getKind } from '../../utils/categories';
import { formatDistance } from '../../utils/geo';
import useStyles from './styles';

const PLACEHOLDER_IMAGE = 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg';

// Google Maps URLs open Google Maps (app or web). No API key or billing needed.
const directionsUrl = (place) => `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${place.id}`;

/** Round icon with a label under it, like the action row in Google Maps' place sheet. */
const Action = ({ icon, label, primary = false, classes, ...props }) => (
  <ButtonBase className={classes.action} {...props}>
    <span className={`${classes.actionIcon} ${primary ? classes.actionPrimary : ''}`}>{icon}</span>
    <span className={classes.actionLabel}>{label}</span>
  </ButtonBase>
);

/**
 * A place's details, shown in the panel / bottom sheet after it is picked.
 * Reviews, phone and website come from Place Details (billed per request),
 * so they're loaded once, when this opens.
 */
const PlaceDetails = ({
  place, loadDetails, isFavorite = false, onToggleFavorite, onBack,
}) => {
  const classes = useStyles();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    loadDetails(place.id)
      .then((d) => !cancelled && setDetails(d))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [place.id, loadDetails]);

  const kind = getKind(place.kind);
  const KindIcon = kind.Icon;
  const meta = [place.priceLevel, place.distanceKm != null ? formatDistance(place.distanceKm) : null].filter(Boolean);

  return (
    <div className={classes.root}>
      {/* Photo with the back button on it, so no separate row is needed */}
      <div className={classes.photoWrap}>
        <img className={classes.photo} src={place.photoUrl || PLACEHOLDER_IMAGE} alt={place.name} loading="lazy" />
        {onBack && (
          <IconButton className={classes.backButton} onClick={onBack} aria-label="返回結果" size="small">
            <ArrowBackIcon />
          </IconButton>
        )}
      </div>

      <div className={classes.content}>
        <Typography variant="h6" className={classes.name}>{place.name}</Typography>

        {/* 4.0 ★★★★☆ (1,665) */}
        <div className={classes.ratingRow}>
          <span className={classes.ratingValue}>{place.rating != null ? place.rating.toFixed(1) : '–'}</span>
          <Rating value={place.rating || 0} precision={0.5} size="small" readOnly />
          <span className={classes.muted}>({place.reviews.toLocaleString()})</span>
        </div>

        {/* 🍴 餐廳 · $$ · 1.8 公里 */}
        <div className={classes.metaRow}>
          <span className={classes.kind} style={{ color: kind.color }}>
            <KindIcon style={{ fontSize: 16 }} />
            {kind.label}
          </span>
          {meta.map((m) => <span key={m} className={classes.muted}>· {m}</span>)}
        </div>

        {/* Actions: directions first (the main thing people want), then save / call / website */}
        <div className={classes.actions}>
          <Action
            classes={classes}
            primary
            icon={<DirectionsIcon />}
            label="導航"
            component="a"
            href={directionsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
          />
          {onToggleFavorite && (
            <Action
              classes={classes}
              icon={isFavorite ? <FavoriteIcon style={{ color: '#e53935' }} /> : <FavoriteBorderIcon />}
              label={isFavorite ? '已收藏' : '收藏'}
              onClick={() => onToggleFavorite(place)}
            />
          )}
          <Action
            classes={classes}
            icon={<PhoneIcon />}
            label="電話"
            component="a"
            href={details?.phone ? `tel:${details.phone}` : undefined}
            disabled={!details?.phone}
          />
          <Action
            classes={classes}
            icon={<LanguageIcon />}
            label="網站"
            component="a"
            href={details?.website || undefined}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!details?.website}
          />
        </div>
      </div>

      <Divider />

      {place.address && (
        <ButtonBase
          className={classes.infoRow}
          component="a"
          href={place.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LocationOnIcon className={classes.infoIcon} />
          <span>{place.address}</span>
        </ButtonBase>
      )}
      {details?.phone && (
        <ButtonBase className={classes.infoRow} component="a" href={`tel:${details.phone}`}>
          <PhoneIcon className={classes.infoIcon} />
          <span>{details.phone}</span>
        </ButtonBase>
      )}

      <Divider />

      <div className={classes.reviews}>
        <Typography variant="subtitle1" className={classes.sectionTitle}>評論</Typography>
        {loading && <div className={classes.center}><CircularProgress size={26} /></div>}
        {error && <Typography color="error" variant="body2">{error}</Typography>}
        {details && details.reviews.length === 0 && (
          <Typography variant="body2" color="textSecondary">目前沒有評論。</Typography>
        )}
        {details?.reviews.map((review) => (
          <div key={`${review.author}-${review.when}`} className={classes.review}>
            <div className={classes.reviewHead}>
              <Avatar src={review.avatar} alt="" className={classes.avatar} />
              <div>
                <Typography variant="subtitle2">{review.author}</Typography>
                <div className={classes.reviewMeta}>
                  <Rating value={review.rating} size="small" readOnly />
                  <span className={classes.muted}>{review.when}</span>
                </div>
              </div>
            </div>
            {review.text && <Typography variant="body2" className={classes.reviewText}>{review.text}</Typography>}
          </div>
        ))}
        {details && (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            className={classes.allReviews}
            href={details.url || place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            在 Google 地圖看全部 {place.reviews.toLocaleString()} 則評論
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlaceDetails;
