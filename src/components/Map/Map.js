import React, { useMemo, useState, useRef, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import {
  Paper, Typography, useMediaQuery, Button, Fab, CircularProgress, Tooltip, Popover, ButtonBase,
} from '@material-ui/core';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Rating from '@material-ui/lab/Rating';
import RoomIcon from '@material-ui/icons/Room';
import SearchIcon from '@material-ui/icons/Search';
import LayersIcon from '@material-ui/icons/Layers';

import useStyles from './styles';
import MAP_THEMES, { getTheme } from '../../mapThemes';
import useLocalStorage from '../../utils/useLocalStorage';
import { describeWeather } from '../../api/weather';
import { layoutLabels, labelLevels, shortName } from '../../utils/labelLayout';
import { getKind, storeChain, CHAIN_COLORS } from '../../utils/categories';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const MAX_ZOOM = 19;
const PLACEHOLDER_IMAGE = 'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg';

/** Round category icon, e.g. fork & knife for restaurants, bed for hotels. */
const KindIcon = ({ kind, classes, size = 22, name = '' }) => {
  const { Icon, color, label } = getKind(kind);
  // Convenience stores: the chain's short name (7 / 全 / 萊 / OK) instead of the generic icon
  const chain = kind === 'store' ? storeChain(name) : null;
  const chainColor = chain ? CHAIN_COLORS[chain] : null;
  return (
    <span
      className={classes.kindIcon}
      style={{ backgroundColor: chainColor ? chainColor.bg : color, color: chainColor ? chainColor.fg : undefined, width: size, height: size }}
      title={label}
    >
      {chain ? (
        <span className={classes.chainText} style={{ fontSize: size * (chain.length > 1 ? 0.42 : 0.55) }}>{chain}</span>
      ) : (
        <Icon style={{ fontSize: size * 0.65 }} />
      )}
    </span>
  );
};

/**
 * The original big card with a photo, used only by the 全部 mode: every place gets one,
 * with no collision handling. Kept on purpose to show (e.g. in a demo) why labels need
 * layout rules: at a normal zoom the cards pile up on top of each other.
 */
const PhotoCard = ({ place, classes }) => (
  <Paper elevation={3} className={classes.paper} style={{ borderTop: `3px solid ${getKind(place.kind).color}` }}>
    <div className={classes.cardTitle}>
      <KindIcon kind={place.kind} name={place.name} classes={classes} size={20} />
      <Typography className={classes.typography} variant="subtitle2">{place.name}</Typography>
    </div>
    {/* loading="lazy": Places photos are billed per load */}
    <img className={classes.cardPhoto} src={place.photoUrl || PLACEHOLDER_IMAGE} alt={place.name} loading="lazy" />
    <Rating name="read-only" size="small" value={place.rating || 0} precision={0.5} readOnly />
  </Paper>
);

/** Hover preview on desktop: name and stars. No photo on the map (photos are billed per load). */
const MarkerCard = ({ place, classes }) => (
  <Paper elevation={3} className={classes.paper} style={{ borderTop: `3px solid ${getKind(place.kind).color}` }}>
    <div className={classes.cardTitle}>
      <KindIcon kind={place.kind} name={place.name} classes={classes} size={20} />
      <Typography className={classes.typography} variant="subtitle2">
        {place.name}
      </Typography>
    </div>
    <Rating name="read-only" size="small" value={place.rating || 0} precision={0.5} readOnly />
  </Paper>
);

/**
 * A marker that grows with the zoom: level 0 icon · 1 icon + ★4.5 · 2 icon + ★4.5 + name.
 * The icon stays exactly on the place; the text extends to the right.
 */
const PlaceLabel = ({ place, level, classes, selected = false }) => {
  if (level === 0 && !selected) {
    return (
      <div className={classes.dot}>
        <KindIcon kind={place.kind} name={place.name} classes={classes} size={24} />
      </div>
    );
  }
  return (
    <div className={`${classes.label} ${selected ? classes.labelSelected : ''}`}>
      <KindIcon kind={place.kind} name={place.name} classes={classes} size={24} />
      {(level >= 1 || selected) && place.rating != null && (
        <span className={classes.labelRating}>★{place.rating.toFixed(1)}</span>
      )}
      {(level >= 2 || selected) && <span className={classes.labelName}>{selected ? place.name : shortName(place.name)}</span>}
    </div>
  );
};

const Map = ({
  coords, zoom, places, setCoords, setZoom, setChildClicked, childClicked, weather, userLocation, onMapsLoaded,
  searchCenter, showSearchHere, onUserMove, onPickCenter, onMapClick, onSearchHere, onLocate, locating, locateError, leftInset = 0, bottomInset = 0,
}) => {
  const isDesktop = useMediaQuery('(min-width:600px)');
  const classes = useStyles();
  // auto: icons, then ratings, then names as you zoom in (default) · icons: icons only · names: always names
  // all: the original "every place is a photo card" view, no collision handling (for comparison)
  const [labelMode, setLabelMode] = useState('auto');
  // Base map (淺色 / 標準 / 衛星 / 地形 / 夜間), remembered between visits
  // Satellite by default (v2 key: earlier visitors also start on satellite once)
  const [themeId, setThemeId] = useLocalStorage('ta-map-theme-v2', 'hybrid');
  const theme = getTheme(themeId);
  const [layersAnchor, setLayersAnchor] = useState(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    mapRef.current.setOptions({ styles: theme.styles });
    mapRef.current.setMapTypeId(theme.mapTypeId);
  }, [mapReady, theme]);

  // Long-press (phones) or right-click (desktop) on the map: make that spot the search centre,
  // like dropping a pin in Google Maps
  const pickCenterRef = useRef(onPickCenter);
  pickCenterRef.current = onPickCenter;
  const mapClickRef = useRef(onMapClick);
  mapClickRef.current = onMapClick;
  const lastMarkerClick = useRef(0); // a tap on a marker must not also count as a tap on the map
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return undefined;
    const { maps } = window.google;
    let timer = null;
    let lastPick = 0;
    const pick = (latLng) => {
      if (!latLng || Date.now() - lastPick < 1000) return; // contextmenu + timer can both fire
      lastPick = Date.now();
      if (navigator.vibrate) navigator.vibrate(30); // small buzz on Android
      if (pickCenterRef.current) pickCenterRef.current({ lat: latLng.lat(), lng: latLng.lng() });
    };
    const cancel = () => { clearTimeout(timer); timer = null; };
    const listeners = [
      map.addListener('mousedown', (e) => { cancel(); timer = setTimeout(() => pick(e.latLng), 600); }),
      map.addListener('mouseup', cancel),
      map.addListener('dragstart', cancel),
      map.addListener('zoom_changed', cancel),
      map.addListener('contextmenu', (e) => { cancel(); pick(e.latLng); }),
      // Tap on empty map: close the place card and lower the sheet, like Google Maps
      map.addListener('click', () => {
        if (Date.now() - lastPick < 1000 || Date.now() - lastMarkerClick.current < 400) return;
        if (mapClickRef.current) mapClickRef.current();
      }),
    ];
    return () => { cancel(); listeners.forEach((l) => maps.event.removeListener(l)); };
  }, [mapReady]);

  const layout = useMemo(() => {
    if (labelMode === 'all') {
      return { cards: places.map((place, index) => ({ place, index })), dots: [], clusters: [], levels: {} };
    }
    const result = layoutLabels(places, zoom, {
      selectedIndex: childClicked, // the clicked place always shows its full label
      maxCards: 0,
      cardWidth: 1,
      cardHeight: 1,
    });
    // Phones, 自動: show name + rating wherever it fits, at any zoom (overlapping ones are shortened)
    const mode = !isDesktop && labelMode === 'auto' ? 'names' : labelMode;
    return { ...result, levels: labelLevels(result.dots, result.clusters, zoom, mode) };
  }, [places, zoom, labelMode, childClicked, isDesktop]);

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
    lastMarkerClick.current = Date.now();
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
        onGoogleApiLoaded={({ map }) => {
          mapRef.current = map;
          setMapReady(true);
          onMapsLoaded(map);
        }}
        defaultCenter={coords}
        center={coords}
        defaultZoom={14}
        zoom={zoom}
        margin={[50, 50, 50, 50]}
        // Phones: no zoom buttons (pinch to zoom), they'd sit under the bottom sheet
        options={{ disableDefaultUI: true, zoomControl: isDesktop, styles: theme.styles, mapTypeId: theme.mapTypeId, maxZoom: MAX_ZOOM, gestureHandling: 'greedy' }}
        onChange={(e) => {
          // Just track where the map is; searching happens only on purpose (see App.js)
          setCoords({ lat: e.center.lat, lng: e.center.lng });
          setZoom(e.zoom);
        }}
        onChildClick={handleChildClick}
        onDrag={() => onUserMove && onUserMove()} // phones: tuck the logo away for more map
      >
        {/* The selected place: always its full name and rating, highlighted */}
        {layout.cards.map(({ place, index }) => (
          labelMode === 'all' ? (
            <div className={classes.markerContainer} lat={place.lat} lng={place.lng} key={`p-${index}`}>
              <PhotoCard place={place} classes={classes} />
            </div>
          ) : (
            <div className={classes.labelContainer} style={{ zIndex: 6 }} lat={place.lat} lng={place.lng} key={`p-${index}`}>
              <PlaceLabel place={place} level={2} classes={classes} selected />
            </div>
          )
        ))}

        {layout.dots.map(({ place, index }) => {
          const level = layout.levels[index] || 0;
          return (
            <div
              className={level ? classes.labelContainer : classes.dotContainer}
              lat={place.lat}
              lng={place.lng}
              key={`p-${index}`}
              onClick={() => { lastMarkerClick.current = Date.now(); setChildClicked(index); }} // the label text is clickable too
            >
              <PlaceLabel place={place} level={level} classes={classes} />
              {/* Desktop: hovering a bare icon shows its name and stars */}
              {isDesktop && level < 2 && (
                <div className={classes.preview}>
                  <MarkerCard place={place} classes={classes} />
                </div>
              )}
            </div>
          );
        })}

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
                      <KindIcon kind={p.kind} name={p.name} classes={classes} size={22} />
                    </span>
                  ))}
                </span>
                <span className={classes.clusterCount}>+{cluster.count - 1}</span>
              </div>
              <div className={classes.clusterTip}>
                <div className={classes.clusterTipTitle}>這裡有 {cluster.count} 個地點重疊</div>
                {members.slice(0, 5).map((p) => (
                  <div key={p.id} className={classes.clusterTipRow}>
                    <KindIcon kind={p.kind} name={p.name} classes={classes} size={16} />
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

      {/* Base map picker, like Google Maps' 圖層 button */}
      <Tooltip title="地圖樣式" placement="left">
        <Fab
          size="medium"
          className={classes.locateFab}
          style={{ bottom: isDesktop ? 176 : `calc(${bottomInset} + 72px)` }}
          onClick={(e) => setLayersAnchor(e.currentTarget)}
          aria-label="地圖樣式"
        >
          <LayersIcon color="primary" />
        </Fab>
      </Tooltip>
      <Popover
        open={Boolean(layersAnchor)}
        anchorEl={layersAnchor}
        onClose={() => setLayersAnchor(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'right' }}
        classes={{ paper: classes.layersPaper }}
      >
        <div className={classes.layersTitle}>地圖樣式</div>
        <div className={classes.layersGrid}>
          {MAP_THEMES.map((t) => (
            <ButtonBase
              key={t.id}
              className={`${classes.layerOption} ${t.id === theme.id ? classes.layerActive : ''}`}
              onClick={() => { setThemeId(t.id); setLayersAnchor(null); }}
            >
              <span className={classes.layerSwatch} style={{ background: t.swatch }}>
                {t.recommended && <span className={classes.layerBadge}>推薦</span>}
              </span>
              <span className={classes.layerLabel}>{t.label}</span>
            </ButtonBase>
          ))}
        </div>
      </Popover>

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

      {/* Weather only on larger screens; on phones it would cover the map */}
      {weatherInfo && isDesktop && (
        <Paper elevation={3} className={classes.weather} style={isDesktop ? undefined : { top: 132 }} aria-label="搜尋中心的天氣">
          <span className={classes.weatherIcon}>{weatherInfo.icon}</span>
          <span>
            <strong>{Math.round(weather.temperature_2m)}°C</strong>
            <br />
            <small>{weatherInfo.text}</small>
          </span>
        </Paper>
      )}

      <Paper elevation={3} className={`${classes.labelToggle} ${isDesktop ? '' : classes.labelToggleMobile}`}>
        <ToggleButtonGroup
          size="small"
          exclusive
          orientation="vertical"
          value={labelMode}
          onChange={(e, value) => value && setLabelMode(value)}
          aria-label="標籤顯示方式"
        >
          <ToggleButton value="auto" className={classes.modeButton} title="放大地圖會依序顯示評分、名稱">自動</ToggleButton>
          <ToggleButton value="icons" className={classes.modeButton}>圖示</ToggleButton>
          <ToggleButton value="names" className={classes.modeButton} title="盡量顯示名稱和評分">名稱</ToggleButton>
          <ToggleButton value="all" className={classes.modeButton} title="每個地點都顯示照片卡片（不處理重疊）">全部</ToggleButton>
        </ToggleButtonGroup>
      </Paper>
    </div>
  );
};

export default Map;
