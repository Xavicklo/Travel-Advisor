import React, { useMemo, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import {
  Paper, Typography, useMediaQuery, Button, Fab, CircularProgress, Tooltip,
} from '@material-ui/core';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Rating from '@material-ui/lab/Rating';
import RoomIcon from '@material-ui/icons/Room';
import SearchIcon from '@material-ui/icons/Search';

import useStyles from './styles';
import mapStyles from '../../mapStyles';
import { describeWeather } from '../../api/weather';
import { layoutLabels } from '../../utils/labelLayout';
import { getKind } from '../../utils/categories';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const PLACEHOLDER_IMAGE = 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg';
const MAX_ZOOM = 19;

/** Round category icon, e.g. fork & knife for restaurants, bed for hotels. */
const KindIcon = ({ kind, classes, size = 22 }) => {
  const { Icon, color, label } = getKind(kind);
  return (
    <span className={classes.kindIcon} style={{ backgroundColor: color, width: size, height: size }} title={label}>
      <Icon style={{ fontSize: size * 0.65 }} />
    </span>
  );
};

/** The full marker card: category icon, name, photo, rating. */
const MarkerCard = ({ place, classes, hiddenCount = 0 }) => (
  <Paper elevation={3} className={classes.paper} style={{ borderTop: `3px solid ${getKind(place.kind).color}` }}>
    <div className={classes.cardTitle}>
      <KindIcon kind={place.kind} classes={classes} size={20} />
      <Typography className={classes.typography} variant="subtitle2">
        {place.name}
      </Typography>
    </div>
    {/* loading="lazy": Places photos are billed per load, so only load the ones actually shown */}
    <img className={classes.pointer} src={place.photoUrl || PLACEHOLDER_IMAGE} alt={place.name} loading="lazy" />
    <Rating name="read-only" size="small" value={place.rating || 0} precision={0.5} readOnly />
    {hiddenCount > 0 && <span className={classes.nearby}>附近還有 {hiddenCount} 個</span>}
  </Paper>
);

const Map = ({
  coords, zoom, places, setCoords, setZoom, setChildClicked, childClicked, weather, userLocation, onMapsLoaded,
  searchCenter, showSearchHere, onSearchHere, onLocate, locating, locateError, leftInset = 0, bottomInset = 0,
}) => {
  const isDesktop = useMediaQuery('(min-width:600px)');
  const classes = useStyles();
  // icons: every place is a small icon (default) · smart: collision-aware cards · all: every place is a card
  const [labelMode, setLabelMode] = useState('icons');

  const layout = useMemo(() => {
    if (labelMode === 'all') {
      return { cards: places.map((place, index) => ({ place, index, hiddenCount: 0 })), dots: [], clusters: [] };
    }
    return layoutLabels(places, zoom, {
      selectedIndex: childClicked, // the clicked place still opens as a card
      maxCards: labelMode === 'icons' ? 0 : 8,
    });
  }, [places, zoom, labelMode, childClicked]);

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
        // Phones: no zoom buttons (pinch to zoom), they'd sit under the bottom sheet
        options={{ disableDefaultUI: true, zoomControl: isDesktop, styles: mapStyles, maxZoom: MAX_ZOOM, gestureHandling: 'greedy' }}
        onChange={(e) => {
          // Just track where the map is; searching happens only on purpose (see App.js)
          setCoords({ lat: e.center.lat, lng: e.center.lng });
          setZoom(e.zoom);
        }}
        onChildClick={handleChildClick}
      >
        {layout.cards.map(({ place, index, hiddenCount }) => (
          <div className={classes.markerContainer} lat={place.lat} lng={place.lng} key={`p-${index}`}>
            {isDesktop ? (
              <MarkerCard place={place} classes={classes} hiddenCount={hiddenCount} />
            ) : (
              <KindIcon kind={place.kind} classes={classes} size={30} />
            )}
          </div>
        ))}

        {layout.dots.map(({ place, index }) => (
          <div className={classes.dotContainer} lat={place.lat} lng={place.lng} key={`p-${index}`}>
            {/* Compact marker: just the category icon; name, photo and rating appear on hover */}
            <div className={classes.dot}>
              <KindIcon kind={place.kind} classes={classes} size={24} />
            </div>
            {isDesktop && (
              <div className={classes.preview}>
                <MarkerCard place={place} classes={classes} />
              </div>
            )}
          </div>
        ))}

        {/* Search centre: distances are measured from here. It stays put when the map is dragged. */}
        {searchCenter && (
          <div className={classes.centerMarker} lat={searchCenter.lat} lng={searchCenter.lng} key="search-center">
            <span className={classes.centerLabel}>搜尋中心</span>
            <RoomIcon className={classes.centerPin} />
          </div>
        )}

        {/* The user's GPS position: a pulsing blue dot, like in Google Maps */}
        {userLocation && (
          <div className={classes.userDot} lat={userLocation.lat} lng={userLocation.lng} key="me" title="你的位置">
            <span className={classes.userPulse} />
          </div>
        )}

        {/* Overlapping places: stacked category icons + count; hover lists them, click zooms in */}
        {layout.clusters.map((cluster, i) => {
          const members = cluster.indexes.map((idx) => places[idx]).filter(Boolean);
          return (
            <div className={classes.clusterContainer} lat={cluster.lat} lng={cluster.lng} key={`c-${i}`}>
              <div className={classes.cluster}>
                <span className={classes.stack}>
                  {members.slice(0, 3).map((p) => (
                    <span key={p.id} className={classes.stackItem}>
                      <KindIcon kind={p.kind} classes={classes} size={22} />
                    </span>
                  ))}
                </span>
                <span className={classes.clusterCount}>+{cluster.count - 1}</span>
              </div>
              <div className={classes.clusterTip}>
                <div className={classes.clusterTipTitle}>這裡有 {cluster.count} 個地點重疊</div>
                {members.slice(0, 5).map((p) => (
                  <div key={p.id} className={classes.clusterTipRow}>
                    <KindIcon kind={p.kind} classes={classes} size={16} />
                    <span className={classes.clusterTipName}>{p.name}</span>
                    {p.rating && <span className={classes.clusterTipRating}>★ {p.rating.toFixed(1)}</span>}
                  </div>
                ))}
                {cluster.count > 5 && <div className={classes.clusterTipMore}>還有 {cluster.count - 5} 個…</div>}
                <div className={classes.clusterTipHint}>🔍 點擊放大查看</div>
              </div>
            </div>
          );
        })}
      </GoogleMapReact>

      {/* Like Google Maps: moving the map doesn't search until the user asks */}
      {showSearchHere && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          className={classes.searchHere}
          style={{ left: `calc(50% + ${leftInset / 2}px)`, top: isDesktop ? 16 : 140 }} // centre of the visible map
          onClick={onSearchHere}
        >
          搜尋這個區域
        </Button>
      )}

      {/* My location, bottom right like Google Maps (above the zoom buttons on desktop) */}
      <Tooltip title={locateError || '以我的位置搜尋'} placement="left">
        <Fab
          size="medium"
          className={classes.locateFab}
          style={{ bottom: isDesktop ? 120 : `calc(${bottomInset} + 16px)` }}
          onClick={onLocate}
          disabled={locating}
          aria-label="以我的位置搜尋"
        >
          {locating ? <CircularProgress size={22} /> : <MyLocationIcon color={locateError ? 'error' : 'primary'} />}
        </Fab>
      </Tooltip>

      {weatherInfo && (
        <Paper elevation={3} className={classes.weather} style={isDesktop ? undefined : { top: 132 }} aria-label="搜尋中心的天氣">
          <span className={classes.weatherIcon}>{weatherInfo.icon}</span>
          <span>
            <strong>{Math.round(weather.temperature_2m)}°C</strong>
            <br />
            <small>{weatherInfo.text}</small>
          </span>
        </Paper>
      )}

      <Paper elevation={3} className={classes.labelToggle} style={isDesktop ? undefined : { top: 196 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={labelMode}
          onChange={(e, value) => value && setLabelMode(value)}
          aria-label="標籤顯示方式"
        >
          <ToggleButton value="icons" className={classes.modeButton}>圖示</ToggleButton>
          <ToggleButton value="smart" className={classes.modeButton}>智慧卡片</ToggleButton>
          <ToggleButton value="all" className={classes.modeButton}>全部卡片</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="textSecondary" component="div" className={classes.modeStats}>
          卡片 {layout.cards.length} · 圖示 {layout.dots.length} · 群集 {layout.clusters.length}
        </Typography>
      </Paper>
    </div>
  );
};

export default Map;
