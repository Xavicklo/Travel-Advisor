import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import { getPlacesData } from './api/places';
import { getWeatherData } from './api/weather';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

// Fallback when the user blocks location access: Taipei 101.
const DEFAULT_COORDS = { lat: 25.0339, lng: 121.5645 };

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');

  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [zoom, setZoom] = useState(14);
  const [bounds, setBounds] = useState(null);

  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null); // google.maps.Map instance, needed by PlacesService
  const [autocomplete, setAutocomplete] = useState(null);
  const [childClicked, setChildClicked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Start at the user's location if they allow it; otherwise stay on the default.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => setCoords({ lat: latitude, lng: longitude }),
      () => {}, // permission denied or unavailable: keep DEFAULT_COORDS
      { timeout: 10000 },
    );
  }, []);

  // Rating filter is derived data, so compute it instead of storing it in state.
  const filteredPlaces = useMemo(
    () => (rating ? places.filter((place) => Number(place.rating) >= Number(rating)) : places),
    [places, rating],
  );

  // Reload places whenever the visible map area or the place type changes.
  useEffect(() => {
    if (!bounds || !mapsLoaded) return undefined;

    // Debounce: wait until the user stops panning/zooming before calling the (billed) Places API.
    // `cancelled` ignores a slow, outdated response so it can't overwrite a newer one.
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsLoading(true);
      setError('');
      getPlacesData(mapRef.current, type, bounds)
        .then((data) => {
          if (cancelled) return;
          setPlaces(data.filter((place) => place.reviews > 0));
          setChildClicked(null);
        })
        .catch((err) => {
          if (cancelled) return;
          setPlaces([]);
          setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bounds, type, mapsLoaded]);

  // Weather for the centre of the map.
  useEffect(() => {
    if (!bounds) return;
    getWeatherData(coords.lat, coords.lng).then(setWeather);
  }, [bounds]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    const place = autocomplete?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return; // user pressed Enter without choosing a suggestion
    setCoords({ lat: location.lat(), lng: location.lng() });
  };

  return (
    <>
      <CssBaseline />
      <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} mapsLoaded={mapsLoaded} />
      <Grid container spacing={3} style={{ width: '100%', margin: 0 }}>
        <Grid item xs={12} md={4}>
          <List
            isLoading={isLoading}
            error={error}
            childClicked={childClicked}
            places={filteredPlaces}
            type={type}
            setType={setType}
            rating={rating}
            setRating={setRating}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Map
            setChildClicked={setChildClicked}
            setBounds={setBounds}
            setCoords={setCoords}
            coords={coords}
            zoom={zoom}
            setZoom={setZoom}
            childClicked={childClicked}
            places={filteredPlaces}
            weather={weather}
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
