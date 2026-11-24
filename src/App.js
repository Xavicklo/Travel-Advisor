import React, { useState, useEffect, useMemo } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import { getPlacesData, getWeatherData } from './api/travelAdvisorAPI';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

// Fallback when the user blocks location access: Taipei 101.
const DEFAULT_COORDS = { lat: 25.0339, lng: 121.5645 };

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');

  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [bounds, setBounds] = useState(null);

  const [weather, setWeather] = useState(null);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');

  const [mapsLoaded, setMapsLoaded] = useState(false);
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
    if (!bounds) return undefined;

    // Cancel the previous request so a slow, outdated response can't overwrite a newer one.
    const controller = new AbortController();
    setIsLoading(true);
    setError('');

    getPlacesData(type, bounds.sw, bounds.ne, { signal: controller.signal })
      .then((data) => {
        setPlaces(data.filter((place) => place.name && place.num_reviews > 0));
        setChildClicked(null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setPlaces([]);
        setError(err.message);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [bounds, type]);

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
            places={filteredPlaces}
            weather={weather}
            onMapsLoaded={() => setMapsLoaded(true)}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default App;
