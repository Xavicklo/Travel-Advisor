import React from 'react';
import { ButtonBase, Typography, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Rating from '@material-ui/lab/Rating';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

import { getKind } from '../../utils/categories';
import { formatDistance } from '../../utils/geo';

const PLACEHOLDER_IMAGE = 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg';

const useStyles = makeStyles((theme) => ({
  row: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    gap: 12,
    padding: theme.spacing(1.5, 2),
    textAlign: 'left',
    borderBottom: '1px solid #eceff1',
    transition: 'background 0.15s ease',
    '&:hover': { background: '#f5f8fa' },
  },
  active: {
    background: '#e8f4fd',
  },
  info: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  name: {
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  ratingLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: theme.palette.text.secondary,
  },
  ratingValue: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    fontSize: 13,
    color: theme.palette.text.secondary,
  },
  kind: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontWeight: 600,
  },
  address: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  thumbWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 8,
    objectFit: 'cover',
    display: 'block',
    background: '#eceff1',
  },
  fav: {
    position: 'absolute',
    top: -6,
    right: -6,
    padding: 4,
    background: 'rgba(255,255,255,0.95)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    '&:hover': { background: '#fff' },
  },
}));

/** Compact result row, like Google Maps: name, rating, category, distance and a thumbnail. */
const PlaceRow = ({ place, active, onSelect, isFavorite, onToggleFavorite }) => {
  const classes = useStyles();
  const { Icon, label, color } = getKind(place.kind);

  return (
    <ButtonBase component="div" className={`${classes.row} ${active ? classes.active : ''}`} onClick={() => onSelect(place)}>
      <div className={classes.info}>
        <Typography className={classes.name}>{place.name}</Typography>
        <div className={classes.ratingLine}>
          <span className={classes.ratingValue}>{place.rating ?? '–'}</span>
          <Rating value={place.rating || 0} precision={0.5} size="small" readOnly />
          <span>({place.reviews.toLocaleString()})</span>
        </div>
        <div className={classes.meta}>
          <span className={classes.kind} style={{ color }}>
            <Icon style={{ fontSize: 15 }} />
            {label}
          </span>
          {place.priceLevel && <span>· {place.priceLevel}</span>}
          {place.distanceKm != null && <span>· {formatDistance(place.distanceKm)}</span>}
        </div>
        {place.address && <span className={classes.address}>{place.address}</span>}
      </div>
      <div className={classes.thumbWrap}>
        {/* loading="lazy": Places photos are billed per load */}
        <img className={classes.thumb} src={place.photoUrl || PLACEHOLDER_IMAGE} alt="" loading="lazy" />
        {onToggleFavorite && (
          <IconButton
            size="small"
            className={classes.fav}
            aria-label={isFavorite ? '取消收藏' : '加入收藏'}
            onClick={(e) => {
              e.stopPropagation(); // don't also open the place
              onToggleFavorite(place);
            }}
          >
            {isFavorite ? <FavoriteIcon style={{ fontSize: 16, color: '#e53935' }} /> : <FavoriteBorderIcon style={{ fontSize: 16 }} />}
          </IconButton>
        )}
      </div>
    </ButtonBase>
  );
};

export default PlaceRow;
