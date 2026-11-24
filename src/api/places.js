/**
 * Places inside the visible map area, from the Google Places API (Nearby Search)
 * through the Maps JavaScript API's PlacesService.
 *
 * The map's current bounds are passed straight to Nearby Search, so the list always
 * matches what the user is looking at.
 */

// Our place types -> Google place types
export const PLACE_TYPES = {
  restaurants: 'restaurant',
  hotels: 'lodging',
  attractions: 'tourist_attraction',
};

const STATUS_MESSAGES = {
  REQUEST_DENIED: 'Google rejected the request. Check that "Places API" is enabled and allowed for this API key.',
  OVER_QUERY_LIMIT: 'Google Places quota reached. Please try again later.',
  INVALID_REQUEST: 'Invalid search request.',
};

/** Google's result -> the shape our components use. */
export const normalizePlace = (result) => ({
  id: result.place_id,
  name: result.name,
  lat: result.geometry.location.lat(),
  lng: result.geometry.location.lng(),
  rating: result.rating ?? null,
  reviews: result.user_ratings_total ?? 0,
  priceLevel: result.price_level != null ? '$'.repeat(Math.max(1, result.price_level)) : null,
  address: result.vicinity || '',
  photoUrl: result.photos?.[0]?.getUrl({ maxWidth: 600, maxHeight: 400 }) || null,
  // Opens the place in Google Maps (phone, hours, website, reviews...). Free: no API call.
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.name)}&query_place_id=${result.place_id}`,
});

/**
 * @param {google.maps.Map} map - needed by PlacesService (it renders attributions there)
 * @param {string} type - restaurants | hotels | attractions
 * @param {{ne: {lat, lng}, sw: {lat, lng}}} bounds
 * @returns {Promise<Array>} normalized places (max 20, Google's page size)
 */
export const getPlacesData = (map, type, bounds) => {
  const { maps } = window.google;
  const service = new maps.places.PlacesService(map);

  const request = {
    bounds: new maps.LatLngBounds(bounds.sw, bounds.ne),
    type: PLACE_TYPES[type],
  };

  return new Promise((resolve, reject) => {
    service.nearbySearch(request, (results, status) => {
      const { OK, ZERO_RESULTS } = maps.places.PlacesServiceStatus;
      if (status === OK) {
        resolve(
          results
            .filter((r) => r.geometry?.location && r.business_status !== 'CLOSED_PERMANENTLY')
            .map(normalizePlace),
        );
      } else if (status === ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(STATUS_MESSAGES[status] || `Could not load places (${status}).`));
      }
    });
  });
};
