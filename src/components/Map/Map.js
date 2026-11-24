import React, { useMemo, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery, Switch, FormControlLabel } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import Rating from '@material-ui/lab/Rating';

import useStyles from './styles';
import mapStyles from '../../mapStyles';
import { describeWeather } from '../../api/weather';
import { layoutLabels } from '../../utils/labelLayout';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const PLACEHOLDER_IMAGE = 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg';
const MAX_ZOOM = 19;

/** The full marker card: name, photo, rating. */
const MarkerCard = ({ place, classes, hiddenCount = 0 }) => (
  <Paper elevation={3} className={classes.paper}>
    <Typography className={classes.typography} variant="subtitle2" gutterBottom>
      {place.name}
    </Typography>
    <img className={classes.pointer} src={place.photoUrl || PLACEHOLDER_IMAGE} alt={place.name} />
    <Rating name="read-only" size="small" value={place.rating || 0} precision={0.5} readOnly />
    {hiddenCount > 0 && <span className={classes.nearby}>附近還有 {hiddenCount} 個</span>}
  </Paper>
);

const Map = ({ coords, zoom, places, setCoords, setZoom, setBounds, setChildClicked, childClicked, weather, onMapsLoaded }) => {
  const isDesktop = useMediaQuery('(min-width:600px)');
  const classes = useStyles();
  const [smartLabels, setSmartLabels] = useState(true);

  // Before: every place is a full card. After: collision-aware cards, dots and clusters.
  const layout = useMemo(() => {
    if (!smartLabels) {
      return { cards: places.map((place, index) => ({ place, index, hiddenCount: 0 })), dots: [], clusters: [] };
    }
    return layoutLabels(places, zoom, { selectedIndex: childClicked });
  }, [places, zoom, smartLabels, childClicked]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className={classes.mapContainer}>
        <Typography className={classes.missingKey}>
          缺少 REACT_APP_GOOGLE_MAPS_API_KEY：請把 .env.example 複製成 .env，並填入 Google Maps 金鑰。
        </Typography>
      </div>
    );
  }

  const zoomInto = (lat, lng) => {
    setCoords({ lat, lng });
    setZoom(Math.min(zoom + 2, MAX_ZOOM));
  };

  // google-map-react reports clicks by child key: "p-<index>" for places, "c-<n>" for clusters
  const handleChildClick = (key) => {
    if (key.startsWith('p-')) {
      setChildClicked(Number(key.slice(2)));
    } else if (key.startsWith('c-')) {
      const cluster = layout.clusters[Number(key.slice(2))];
      if (cluster) zoomInto(cluster.lat, cluster.lng);
    }
  };

  const weatherInfo = weather ? describeWeather(weather.weather_code, weather.is_day) : null;

  return (
    <div className={classes.mapContainer}>
      <GoogleMapReact
        // One loader for the whole app: the Maps JavaScript API plus the Places library.
        bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY, libraries: ['places'], language: 'zh-TW', region: 'TW' }}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map }) => onMapsLoaded(map)}
        defaultCenter={coords}
        center={coords}
        defaultZoom={14}
        zoom={zoom}
        margin={[50, 50, 50, 50]}
        options={{ disableDefaultUI: true, zoomControl: true, styles: mapStyles, maxZoom: MAX_ZOOM }}
        onChange={(e) => {
          setCoords({ lat: e.center.lat, lng: e.center.lng });
          setZoom(e.zoom);
          // marginBounds = visible area minus the margin above, so markers aren't cut off at the edges.
          setBounds({ ne: e.marginBounds.ne, sw: e.marginBounds.sw });
        }}
        onChildClick={handleChildClick}
      >
        {layout.cards.map(({ place, index, hiddenCount }) => (
          <div className={classes.markerContainer} lat={place.lat} lng={place.lng} key={`p-${index}`}>
            {isDesktop ? (
              <MarkerCard place={place} classes={classes} hiddenCount={hiddenCount} />
            ) : (
              <LocationOnOutlinedIcon color="primary" fontSize="large" />
            )}
          </div>
        ))}

        {layout.dots.map(({ place, index }) => (
          <div className={classes.dotContainer} lat={place.lat} lng={place.lng} key={`p-${index}`}>
            <div className={classes.dot} title={place.name}>
              {place.rating ? place.rating.toFixed(1) : '•'}
            </div>
            {isDesktop && (
              <div className={classes.preview}>
                <MarkerCard place={place} classes={classes} />
              </div>
            )}
          </div>
        ))}

        {layout.clusters.map((cluster, i) => (
          <div
            className={classes.cluster}
            lat={cluster.lat}
            lng={cluster.lng}
            key={`c-${i}`}
            title={`${cluster.count} 個地點，點擊放大`}
          >
            {cluster.count}
          </div>
        ))}
      </GoogleMapReact>

      {weatherInfo && (
        <Paper elevation={3} className={classes.weather} aria-label="地圖中心的天氣">
          <span className={classes.weatherIcon}>{weatherInfo.icon}</span>
          <span>
            <strong>{Math.round(weather.temperature_2m)}°C</strong>
            <br />
            <small>{weatherInfo.text}</small>
          </span>
        </Paper>
      )}

      <Paper elevation={3} className={classes.labelToggle}>
        <FormControlLabel
          control={<Switch checked={smartLabels} onChange={(e) => setSmartLabels(e.target.checked)} color="primary" size="small" />}
          label="智慧標籤"
        />
        {smartLabels && (
          <Typography variant="caption" color="textSecondary" component="div">
            卡片 {layout.cards.length} · 圓點 {layout.dots.length} · 群集 {layout.clusters.length}
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default Map;
