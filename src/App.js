import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import { getPlacesData, getPlaceDetails, findNearest } from './api/places';
import { getWeatherData } from './api/weather';
import { score } from './utils/labelLayout';
import { distanceKm } from './utils/geo';
import useLocalStorage from './utils/useLocalStorage';
import Header from './components/Header/Header';
import List from './components/List/List';
// Named MapView so it doesn't shadow JavaScript's built-in Map (used for the search cache)
import MapView from './components/Map/Map';

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
  const [childClicked, setChildClicked] = useState(null);
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

  // After a new search centre or radius, zoom the map so the whole circle is visible.
  useEffect(() => {
    if (!mapsLoaded || !circleRef.current) return;
    mapRef.current.fitBounds(circleRef.current.getBounds(), 20);
  }, [mapsLoaded, radiusKm, fitNonce]);

  // ---- Search: only when the search centre, radius, type or keyword changes ----
  const activeKeyword = type === 'restaurants' ? keyword.trim() : '';
  // Same type + keyword + radius + centre (rounded to ~100 m) = same search
  const searchKey = `${type}|${activeKeyword}|${radiusKm}|${searchCenter.lat.toFixed(3)},${searchCenter.lng.toFixed(3)}`;

  useEffect(() => {
    if (!mapsLoaded || !geoReady) return undefined;
    let cancelled = false;
    const center = searchCenter;

    const showResults = (list, more) => {
      setPlaces(withReviews(list));
      setLoadMore(() => more); // store the function itself, not call it
      setChildClicked(null);
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
    setType('restaurants');
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

  // Just look at a place on the map (doesn't start a new search).
  const showOnMap = (place) => {
    setCoords({ lat: place.lat, lng: place.lng });
    setZoom(17);
  };

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    const place = autocomplete?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return; // user pressed Enter without choosing a suggestion
    searchAt({ lat: location.lat(), lng: location.lng() }, place.name || '');
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
            hasMore={!!loadMore}
            onLoadMore={handleLoadMore}
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
          <MapView
            setChildClicked={setChildClicked}
            setCoords={setCoords}
            coords={coords}
            searchCenter={searchCenter}
            showSearchHere={movedAway && mapsLoaded}
            onSearchHere={searchHere}
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
