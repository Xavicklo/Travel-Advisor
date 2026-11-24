import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import { getPlacesData, getPlaceDetails, findNearest } from './api/places';
import { getWeatherData } from './api/weather';
import { score } from './utils/labelLayout';
import { distanceKm } from './utils/geo';
import useLocalStorage from './utils/useLocalStorage';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

// Fallback when the user blocks location access: Taipei 101.
const DEFAULT_COORDS = { lat: 25.0339, lng: 121.5645 };
const DEFAULT_RADIUS_KM = 3;
const MAX_RECENT_SEARCHES = 8;

const SORTERS = {
  recommended: (a, b) => score(b) - score(a), // rating weighted by number of reviews
  rating: (a, b) => (b.rating || 0) - (a.rating || 0) || b.reviews - a.reviews,
  distance: (a, b) => a.distanceKm - b.distanceKm,
  reviews: (a, b) => b.reviews - a.reviews,
};

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');
  const [keyword, setKeyword] = useState(''); // food keyword, e.g. 火鍋 (restaurants only)
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM); // distance slider
  const [sortBy, setSortBy] = useState('recommended');

  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [userLocation, setUserLocation] = useState(null); // the user's GPS position (blue dot)
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [fitNonce, setFitNonce] = useState(0); // bump to zoom the map to the search circle
  const [centerLabel, setCenterLabel] = useState(''); // name of the search centre, e.g. 我的位置 or a searched place

  // Saved in the browser (localStorage), so they're still there next time
  const [recentSearches, setRecentSearches] = useLocalStorage('travel-advisor:recent-searches', []);
  const [favorites, setFavorites] = useLocalStorage('travel-advisor:favorites', []);
  const [zoom, setZoom] = useState(14);
  const [bounds, setBounds] = useState(null);

  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');
  const [nearest, setNearest] = useState(null); // closest match outside the circle when nothing is inside

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null); // google.maps.Map instance, needed by PlacesService
  const circleRef = useRef(null); // the search-radius circle drawn on the map
  const [autocomplete, setAutocomplete] = useState(null);
  const [childClicked, setChildClicked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Start at the user's location if they allow it; otherwise stay on the default.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        const here = { lat: latitude, lng: longitude };
        setUserLocation(here);
        setCoords(here);
      },
      () => {}, // permission denied or unavailable: keep DEFAULT_COORDS
      { timeout: 10000 },
    );
  }, []);

  // "以我的位置搜尋": move the search centre to the user's GPS position and fit the circle.
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
        setCoords(here);
        setCenterLabel('我的位置');
        setFitNonce((n) => n + 1);
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
  }, []);

  // The search circle is centred on the map. Round the centre (~10 m) so tiny
  // map adjustments don't trigger a new (billed) search.
  const centerKey = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}`;

  // Draw the search radius on the map and keep it in sync.
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
    circleRef.current.setCenter(coords);
    circleRef.current.setRadius(radiusKm * 1000);
  }, [mapsLoaded, coords, radiusKm]);

  // When the slider changes (or after "use my location"), zoom the map so the whole circle is visible.
  // This effect runs after the one above, so the circle is already at its new centre.
  useEffect(() => {
    if (!mapsLoaded || !circleRef.current) return;
    mapRef.current.fitBounds(circleRef.current.getBounds(), 20);
  }, [mapsLoaded, radiusKm, fitNonce]);

  // Search again when the centre, radius, type or keyword changes.
  useEffect(() => {
    if (!mapsLoaded) return undefined;

    // Debounce: wait until the user stops panning or dragging the slider.
    // `cancelled` ignores responses from an older search.
    let cancelled = false;
    const isCancelled = () => cancelled;
    const center = { lat: coords.lat, lng: coords.lng };

    const timer = setTimeout(() => {
      setIsLoading(true);
      setIsLoadingMore(true);
      setError('');
      getPlacesData(mapRef.current, type, { center, radiusKm }, type === 'restaurants' ? keyword : '', {
        isCancelled,
        // Pages 2 and 3 arrive a few seconds later: append them (without duplicates).
        onMore: (more) => setPlaces((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...more.filter((p) => !seen.has(p.id) && p.reviews > 0)];
        }),
      })
        .then((data) => {
          if (cancelled) return;
          setPlaces(data.filter((place) => place.reviews > 0));
          setNearest(null);
          // Remember keyword searches that found something (newest first, no duplicates)
          if (type === 'restaurants' && keyword.trim() && data.length > 0) {
            const entry = {
              id: `${keyword.trim()}|${centerKey}|${radiusKm}`,
              keyword: keyword.trim(),
              radiusKm,
              center,
              label: centerLabel || `${center.lat.toFixed(3)}, ${center.lng.toFixed(3)}`,
              savedAt: Date.now(),
            };
            setRecentSearches((prev) => [entry, ...prev.filter((s) => s.id !== entry.id)].slice(0, MAX_RECENT_SEARCHES));
          }
          // Nothing inside the circle for this keyword: find the closest one outside it.
          const activeKeyword = type === 'restaurants' ? keyword.trim() : '';
          if (data.length === 0 && activeKeyword) {
            findNearest(mapRef.current, type, center, activeKeyword).then((n) => !cancelled && setNearest(n));
          }
          setChildClicked(null);
          setTimeout(() => !cancelled && setIsLoadingMore(false), 5000); // pages 2-3 take ~2 s each
        })
        .catch((err) => {
          if (cancelled) return;
          setPlaces([]);
          setError(err.message);
          setIsLoadingMore(false);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [centerKey, radiusKm, type, keyword, mapsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rating filter and sorting are derived data, so compute them instead of storing them.
  const visiblePlaces = useMemo(() => {
    const filtered = rating ? places.filter((place) => Number(place.rating) >= Number(rating)) : places;
    return [...filtered].sort(SORTERS[sortBy]);
  }, [places, rating, sortBy]);

  // Weather for the centre of the map.
  useEffect(() => {
    if (!bounds) return;
    getWeatherData(coords.lat, coords.lng).then(setWeather);
  }, [bounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDetails = useCallback((placeId) => getPlaceDetails(mapRef.current, placeId), []);

  // Dragging the map moves the centre away from any named place.
  const coordsRef = useRef(coords);
  coordsRef.current = coords;
  const handleMapMove = useCallback((next) => {
    if (distanceKm(coordsRef.current, next) > 0.05) setCenterLabel(''); // moved more than 50 m
    setCoords(next);
  }, []);

  // Re-run a saved search: same place, radius and keyword.
  const applySearch = (search) => {
    setType('restaurants');
    setKeyword(search.keyword);
    setRadiusKm(search.radiusKm);
    setCoords(search.center);
    setCenterLabel(search.label);
    setFitNonce((n) => n + 1);
  };
  const removeSearch = (id) => setRecentSearches((prev) => prev.filter((s) => s.id !== id));

  // Favourites: whole place objects, so they can be shown without another API call.
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);
  const toggleFavorite = (place) => setFavorites((prev) => (prev.some((f) => f.id === place.id)
    ? prev.filter((f) => f.id !== place.id)
    : [{ ...place, savedAt: Date.now() }, ...prev]));

  // Favourites show their distance from the current search centre.
  const favoritesWithDistance = useMemo(
    () => favorites.map((f) => ({ ...f, distanceKm: distanceKm(coords, f) })),
    [favorites, coords],
  );

  const showOnMap = (place) => {
    setCoords({ lat: place.lat, lng: place.lng });
    setCenterLabel(place.name);
    setZoom(17);
  };

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    const place = autocomplete?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return; // user pressed Enter without choosing a suggestion
    setCoords({ lat: location.lat(), lng: location.lng() });
    setCenterLabel(place.name || '');
  };

  return (
    <>
      <CssBaseline />
      <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} mapsLoaded={mapsLoaded} />
      <Grid container spacing={3} style={{ width: '100%', margin: 0 }}>
        <Grid item xs={12} md={4}>
          <List
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            childClicked={childClicked}
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
            loadDetails={loadDetails}
            nearest={nearest}
            recentSearches={recentSearches}
            onApplySearch={applySearch}
            onRemoveSearch={removeSearch}
            favorites={favoritesWithDistance}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onShowOnMap={showOnMap}
            onLocate={locateMe}
            locating={locating}
            locateError={locateError}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Map
            setChildClicked={setChildClicked}
            setBounds={setBounds}
            setCoords={handleMapMove}
            coords={coords}
            zoom={zoom}
            setZoom={setZoom}
            childClicked={childClicked}
            places={visiblePlaces}
            weather={weather}
            userLocation={userLocation}
            onMapsLoaded={(map) => {
              mapRef.current = map;
              setMapsLoaded(true);
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default App;
