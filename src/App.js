import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CssBaseline, Paper, IconButton, useMediaQuery } from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { getPlacesData, getPlaceDetails, findNearest } from './api/places';
import { getWeatherData } from './api/weather';
import { score } from './utils/labelLayout';
import { detectCategory } from './utils/categories';
import { distanceKm } from './utils/geo';
import useLocalStorage from './utils/useLocalStorage';
import Header from './components/Header/Header';
import List from './components/List/List';
// Named MapView so it doesn't shadow JavaScript's built-in Map (used for the search cache)
import MapView from './components/Map/Map';
import useStyles, { PANEL_WIDTH, PANEL_GAP } from './AppStyles';
import BottomSheet, { snapHeight } from './components/BottomSheet/BottomSheet';

// Fallback when the user blocks location access: Taipei 101.
const DEFAULT_COORDS = { lat: 25.0339, lng: 121.5645 };
const DEFAULT_RADIUS_KM = 3;
const MAX_RECENT_SEARCHES = 8;
const CACHE_TTL_MS = 10 * 60 * 1000; // reuse identical searches for 10 minutes

const SORTERS = {
  recommended: (a, b) => score(b) - score(a), // rating weighted by number of reviews
  rating: (a, b) => (b.rating || 0) - (a.rating || 0) || b.reviews - a.reviews,
  distance: (a, b) => a.distanceKm - b.distanceKm,
  reviews: (a, b) => b.reviews - a.reviews,
};

const withReviews = (list) => list.filter((place) => place.reviews > 0);

const App = () => {
  const classes = useStyles();
  const isDesktop = useMediaQuery('(min-width:900px)');
  const [panelOpen, setPanelOpen] = useState(true); // desktop side panel
  const [sheetSnap, setSheetSnap] = useState('peek'); // phone bottom sheet: peek | half | full; closed by default
  // Show results: open the desktop panel, or pull the phone sheet up to half if it's closed
  const openPanel = useCallback(() => {
    setPanelOpen(true);
    setSheetSnap((snap) => (snap === 'peek' ? 'half' : snap));
  }, []);
  const [selectedPlace, setSelectedPlace] = useState(null); // the place shown in the panel's details view

  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState(0); // minimum stars, 0 = no minimum (rating slider)
  const [keyword, setKeyword] = useState(''); // food keyword, e.g. 火鍋 (restaurants only)
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM); // distance slider
  const [sortBy, setSortBy] = useState('recommended');

  // Two different centres:
  // - coords: where the map is looking right now (changes on every drag)
  // - searchCenter: where the last search was done (changes only on purpose)
  // Dragging the map does NOT search; it shows a "搜尋這個區域" button instead.
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [searchCenter, setSearchCenter] = useState(DEFAULT_COORDS);
  const [centerLabel, setCenterLabel] = useState(''); // name of the search centre, e.g. 我的位置
  const [userLocation, setUserLocation] = useState(null); // the user's GPS position (blue dot)
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [fitNonce, setFitNonce] = useState(0); // bump to zoom the map to the search circle
  const [zoom, setZoom] = useState(14);

  // Saved in the browser (localStorage), so they're still there next time
  const [recentSearches, setRecentSearches] = useLocalStorage('travel-advisor:recent-searches', []);
  const [favorites, setFavorites] = useLocalStorage('travel-advisor:favorites', []);

  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loadMore, setLoadMore] = useState(null); // next page of results, fetched only on request
  const [error, setError] = useState('');
  const [nearest, setNearest] = useState(null); // closest match outside the circle when nothing is inside

  const [mapsLoaded, setMapsLoaded] = useState(false);
  // Wait for the first location answer before searching, so we don't search Taipei 101 and then
  // immediately search again at the user's position (one wasted, billed request).
  const [geoReady, setGeoReady] = useState(() => !navigator.geolocation);
  const mapRef = useRef(null); // google.maps.Map instance, needed by PlacesService
  const circleRef = useRef(null); // the search-radius circle drawn on the map
  const cacheRef = useRef(new Map()); // search key -> { places, loadMore, time }
  const [autocomplete, setAutocomplete] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Search at a new centre (and point the map there).
  const searchAt = useCallback((center, label = '') => {
    setCoords(center);
    setSearchCenter(center);
    setCenterLabel(label);
    setFitNonce((n) => n + 1);
  }, []);

  // Start at the user's location if they allow it; otherwise stay on the default.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const here = { lat: latitude, lng: longitude };
        setUserLocation(here);
        searchAt(here, '我的位置');
        setGeoReady(true);
      },
      () => setGeoReady(true), // permission denied or unavailable: keep DEFAULT_COORDS
      { timeout: 5000, maximumAge: 5 * 60 * 1000 },
    );
  }, [searchAt]);

  // "以我的位置搜尋": move the search centre to the user's GPS position.
  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocateError('這個瀏覽器不支援定位功能。');
      return;
    }
    setLocating(true);
    setLocateError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const here = { lat: latitude, lng: longitude };
        setUserLocation(here);
        searchAt(here, '我的位置');
        setLocating(false);
      },
      (err) => {
        setLocateError(err.code === err.PERMISSION_DENIED
          ? '你沒有允許定位：請在網址列左側的設定中允許「位置」權限。'
          : '目前無法取得你的位置，請稍後再試。');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [searchAt]);

  // Draw the search radius around the search centre.
  useEffect(() => {
    if (!mapsLoaded) return;
    const { maps } = window.google;
    if (!circleRef.current) {
      circleRef.current = new maps.Circle({
        map: mapRef.current,
        clickable: false,
        strokeColor: '#1cb5e0',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#1cb5e0',
        fillOpacity: 0.06,
      });
    }
    circleRef.current.setCenter(searchCenter);
    circleRef.current.setRadius(radiusKm * 1000);
  }, [mapsLoaded, searchCenter, radiusKm]);

  // After a new search centre or radius, zoom the map so the whole circle is visible,
  // leaving room for the panel that covers part of the map.
  useEffect(() => {
    if (!mapsLoaded || !circleRef.current) return;
    const padding = isDesktop
      ? { top: 24, right: 24, bottom: 24, left: (panelOpen ? PANEL_WIDTH + PANEL_GAP : 0) + 24 }
      : { top: 130, right: 56, bottom: snapHeight(sheetSnap) + 16, left: 16 };
    mapRef.current.fitBounds(circleRef.current.getBounds(), padding);
  }, [mapsLoaded, radiusKm, fitNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Search: only when the search centre, radius, type or keyword changes ----
  const activeKeyword = keyword.trim(); // e.g. 火鍋 (restaurants), 汽車旅館 (hotels), 夜市 (attractions)
  // Same type + keyword + radius + centre (rounded to ~100 m) = same search
  const searchKey = `${type}|${activeKeyword}|${radiusKm}|${searchCenter.lat.toFixed(3)},${searchCenter.lng.toFixed(3)}`;

  useEffect(() => {
    if (!mapsLoaded || !geoReady) return undefined;
    let cancelled = false;
    const center = searchCenter;

    const showResults = (list, more) => {
      setPlaces(withReviews(list));
      setLoadMore(() => more); // store the function itself, not call it
      setSelectedPlace(null);
      setNearest(null);
      setError('');
    };

    // 1. Cache hit: identical search in the last 10 minutes, no API call
    const cached = cacheRef.current.get(searchKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      showResults(cached.places, cached.loadMore);
      return undefined;
    }

    // 2. Otherwise ask Google (debounced, so dragging the slider fires one request)
    const timer = setTimeout(() => {
      setIsLoading(true);
      setError('');
      getPlacesData(mapRef.current, type, { center, radiusKm }, activeKeyword)
        .then(({ places: found, loadMore: more }) => {
          if (cancelled) return;
          cacheRef.current.set(searchKey, { places: found, loadMore: more, time: Date.now() });
          showResults(found, more);

          // Remember keyword searches that found something (newest first, no duplicates)
          if (activeKeyword && found.length > 0) {
            const entry = {
              id: searchKey,
              type,
              keyword: activeKeyword,
              radiusKm,
              center,
              label: centerLabel || `${center.lat.toFixed(3)}, ${center.lng.toFixed(3)}`,
              savedAt: Date.now(),
            };
            setRecentSearches((prev) => [entry, ...prev.filter((s) => s.id !== entry.id)].slice(0, MAX_RECENT_SEARCHES));
          }
          // Nothing inside the circle for this keyword: find the closest one outside it.
          if (found.length === 0 && activeKeyword) {
            findNearest(mapRef.current, type, center, activeKeyword).then((n) => !cancelled && setNearest(n));
          }
        })
        .catch((err) => {
          if (cancelled) return;
          setPlaces([]);
          setLoadMore(null);
          setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchKey, mapsLoaded, geoReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // "載入更多": fetch the next page only when the user asks for it.
  const handleLoadMore = useCallback(() => {
    if (!loadMore || isLoadingMore) return;
    const key = searchKey;
    setIsLoadingMore(true);
    loadMore()
      .then(({ places: more, loadMore: next }) => {
        setPlaces((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const merged = [...prev, ...withReviews(more).filter((p) => !seen.has(p.id))];
          const cached = cacheRef.current.get(key);
          if (cached) cacheRef.current.set(key, { ...cached, places: merged, loadMore: next });
          return merged;
        });
        setLoadMore(() => next);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoadingMore(false));
  }, [loadMore, isLoadingMore, searchKey]);

  // Weather for the search centre: fetched once per search, not on every drag.
  useEffect(() => {
    getWeatherData(searchCenter.lat, searchCenter.lng).then(setWeather);
  }, [searchCenter]);

  // Rating filter and sorting are derived data, so compute them instead of storing them.
  const visiblePlaces = useMemo(() => {
    const filtered = rating ? places.filter((place) => Number(place.rating) >= Number(rating)) : places;
    return [...filtered].sort(SORTERS[sortBy]);
  }, [places, rating, sortBy]);

  // Show "搜尋這個區域" once the map has moved noticeably away from the search centre.
  const movedAway = distanceKm(coords, searchCenter) > Math.max(0.05, radiusKm * 0.3);
  const searchHere = () => searchAt(coords, '');

  const loadDetails = useCallback((placeId) => getPlaceDetails(mapRef.current, placeId), []);

  // Re-run a saved search: same place, radius and keyword.
  const applySearch = (search) => {
    setType(search.type || 'restaurants');
    setKeyword(search.keyword);
    setRadiusKm(search.radiusKm);
    searchAt(search.center, search.label);
  };
  const removeSearch = (id) => setRecentSearches((prev) => prev.filter((s) => s.id !== id));

  // Favourites: whole place objects, so they can be shown without another API call.
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);
  const toggleFavorite = (place) => setFavorites((prev) => (prev.some((f) => f.id === place.id)
    ? prev.filter((f) => f.id !== place.id)
    : [{ ...place, savedAt: Date.now() }, ...prev]));

  // Favourites show their distance from the current search centre.
  const favoritesWithDistance = useMemo(
    () => favorites.map((f) => ({ ...f, distanceKm: distanceKm(searchCenter, f) })),
    [favorites, searchCenter],
  );

  // Pick a place (from the list or the map): show its details in the panel.
  const selectPlace = (place) => {
    setSelectedPlace(place);
    openPanel();
  };
  // The selected place's position in the current results (for the map's marker layout)
  const selectedIndex = selectedPlace ? visiblePlaces.findIndex((p) => p.id === selectedPlace.id) : -1;

  // A saved favourite may be anywhere: move the map there (doesn't start a new search).
  const selectFavorite = (place) => {
    selectPlace(place);
    setCoords({ lat: place.lat, lng: place.lng });
    setZoom(17);
  };

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    const place = autocomplete?.getPlace();
    const location = place?.geometry?.location;
    if (location) {
      // Picked a suggestion (a city, address or landmark): search around it
      searchAt({ lat: location.lat(), lng: location.lng() }, place.name || '');
      return;
    }
    // Typed something and pressed Enter, e.g. "火鍋", "motel", "夜市": an all-in-one search.
    // Work out the category from the words, then search around the current map view.
    const text = (place?.name || '').trim();
    if (!text) return;
    setType(detectCategory(text));
    setKeyword(text);
    setSelectedPlace(null);
    if (movedAway) searchAt(coords, '');
    openPanel();
  };

  const header = (
    <Header
      onPlaceChanged={onPlaceChanged}
      onLoad={onLoad}
      mapsLoaded={mapsLoaded}
      actions={isDesktop && (
        <IconButton
          size="small"
          className={classes.collapseButton}
          onClick={() => setPanelOpen((open) => !open)}
          aria-label={panelOpen ? '收起面板' : '展開面板'}
          title={panelOpen ? '收起面板' : '展開面板'}
        >
          {panelOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      )}
    />
  );

  const list = (
    <List
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={!!loadMore}
      onLoadMore={handleLoadMore}
      error={error}
      places={visiblePlaces}
      type={type}
      setType={setType}
      keyword={keyword}
      setKeyword={setKeyword}
      rating={rating}
      setRating={setRating}
      radiusKm={radiusKm}
      setRadiusKm={setRadiusKm}
      sortBy={sortBy}
      setSortBy={setSortBy}
      selectedPlace={selectedPlace}
      onSelectPlace={selectPlace}
      onBack={() => setSelectedPlace(null)}
      loadDetails={loadDetails}
      nearest={nearest}
      recentSearches={recentSearches}
      onApplySearch={applySearch}
      onRemoveSearch={removeSearch}
      favorites={favoritesWithDistance}
      favoriteIds={favoriteIds}
      onToggleFavorite={toggleFavorite}
      onSelectFavorite={selectFavorite}
    />
  );

  return (
    <div className={classes.root}>
      <CssBaseline />

      {/* The map fills the whole screen; everything else floats on top of it */}
      <div className={classes.map}>
        <MapView
          setChildClicked={(index) => index != null && visiblePlaces[index] && selectPlace(visiblePlaces[index])}
          setCoords={setCoords}
          coords={coords}
          searchCenter={searchCenter}
          showSearchHere={movedAway && mapsLoaded}
          onSearchHere={searchHere}
          onLocate={locateMe}
          locating={locating}
          locateError={locateError}
          zoom={zoom}
          setZoom={setZoom}
          childClicked={selectedIndex >= 0 ? selectedIndex : null}
          places={visiblePlaces}
          weather={weather}
          userLocation={userLocation}
          leftInset={isDesktop && panelOpen ? PANEL_WIDTH + PANEL_GAP : 0}
          bottomInset={!isDesktop ? `${snapHeight(sheetSnap)}px` : 0}
          onMapsLoaded={(map) => {
            mapRef.current = map;
            setMapsLoaded(true);
          }}
        />
      </div>

      {isDesktop ? (
        <Paper elevation={6} className={`${classes.panel} ${panelOpen ? '' : classes.panelCollapsed}`}>
          {header}
          {panelOpen && <div className={classes.panelBody}>{list}</div>}
        </Paper>
      ) : (
        <>
          <Paper elevation={6} className={classes.mobileHeader}>{header}</Paper>
          {/* Swipe the handle up or down, like Apple/Google Maps */}
          <BottomSheet
            snap={sheetSnap}
            onSnapChange={setSheetSnap}
            summary={selectedPlace ? selectedPlace.name
              : isLoading ? '搜尋中…'
                : `${visiblePlaces.length} 個結果 · 往上滑查看`}
          >
            {list}
          </BottomSheet>
        </>
      )}
    </div>
  );
};

export default App;
