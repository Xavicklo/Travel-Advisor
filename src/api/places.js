import { belongsTo, classify } from '../utils/categories';
import { distanceKm } from '../utils/geo';

/**
 * Google Places API (through the Maps JavaScript API's PlacesService).
 *
 * - getPlacesData: Nearby Search inside a circle (map centre + radius from the
 *   distance slider), optionally filtered by a keyword such as "火鍋" (hot pot).
 * - getPlaceDetails: reviews, phone, website. Called only when the user opens
 *   a place's reviews, because Place Details is billed per request.
 */

// Our place types -> Google place types
export const PLACE_TYPES = {
  restaurants: 'restaurant',
  hotels: 'lodging',
  attractions: 'tourist_attraction',
};

const MAX_PAGES = 3; // Google returns 20 results per page, so up to 60 places in total
const MAX_RADIUS_M = 50000; // Nearby Search limit

const STATUS_MESSAGES = {
  REQUEST_DENIED: 'Google 拒絕了這次查詢：請確認已啟用「Places API」，而且這把金鑰允許使用它。',
  OVER_QUERY_LIMIT: 'Google Places 查詢額度已用完，請稍後再試。',
  INVALID_REQUEST: '查詢參數有誤。',
};

/** Google's result -> the shape our components use. */
export const normalizePlace = (result, category = 'restaurants', center = null) => {
  const lat = result.geometry.location.lat();
  const lng = result.geometry.location.lng();
  return {
    id: result.place_id,
    name: result.name,
    lat,
    lng,
    rating: result.rating ?? null,
    reviews: result.user_ratings_total ?? 0,
    priceLevel: result.price_level != null ? '$'.repeat(Math.max(1, result.price_level)) : null,
    address: result.vicinity || '',
    photoUrl: result.photos?.[0]?.getUrl({ maxWidth: 600, maxHeight: 400 }) || null,
    types: result.types || [],
    kind: classify(result.types, category), // restaurant | cafe | bakery | bar | lodging | attraction
    distanceKm: center ? distanceKm(center, { lat, lng }) : null,
    // Opens the place in Google Maps (all reviews, hours, photos). Free: no API call.
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.name)}&query_place_id=${result.place_id}`,
  };
};

/**
 * Nearby Search in a circle. Returns only the first page (20 places) plus a
 * `loadMore` function for the next page (null when there are no more), so extra
 * billed requests happen only when the user asks for more results.
 *
 * @param {google.maps.Map} map - needed by PlacesService (it renders attributions there)
 * @param {string} type - restaurants | hotels | attractions
 * @param {{center: {lat, lng}, radiusKm: number}} area
 * @param {string} [keyword] - e.g. "火鍋": only places matching it
 * @returns {Promise<{places: Array, loadMore: (() => Promise) | null}>}
 */
export const getPlacesData = (map, type, area, keyword = '') => {
  const { maps } = window.google;
  const service = new maps.places.PlacesService(map);

  const request = {
    location: area.center,
    radius: Math.min(area.radiusKm * 1000, MAX_RADIUS_M),
    type: PLACE_TYPES[type],
  };
  if (keyword.trim()) request.keyword = keyword.trim();

  const toPlaces = (results) => results
    .filter((r) => r.geometry?.location && r.business_status !== 'CLOSED_PERMANENTLY')
    .filter((r) => belongsTo(r.types, type)) // e.g. no hotels under "restaurants"
    .map((r) => normalizePlace(r, type, area.center))
    .filter((p) => p.distanceKm <= area.radiusKm * 1.05); // Google sometimes returns places just outside

  // PlacesService calls the same callback for every page, so route each call to
  // whichever promise is currently waiting for a page.
  let waiting = null;
  let page = 0;

  const makeLoadMore = (pagination, receivedAt) => {
    if (!pagination?.hasNextPage || page >= MAX_PAGES) return null;
    return () => new Promise((resolve, reject) => {
      waiting = { resolve, reject };
      // Google's next-page token only becomes valid ~2 s after the previous page arrived.
      const wait = Math.max(0, 2000 - (Date.now() - receivedAt));
      setTimeout(() => pagination.nextPage(), wait);
    });
  };

  const { OK, ZERO_RESULTS } = maps.places.PlacesServiceStatus;

  // Text Search fallback: Nearby Search's keyword only matches names and short
  // descriptions, so "汽車旅館" misses motels called "XX Motel" or "XX 精品旅館".
  // Text Search understands what the words mean. It's used only when Nearby Search
  // found nothing, so a normal search still costs one request.
  let usedTextSearch = false;
  const textSearchFallback = (current) => {
    usedTextSearch = true;
    page = 0;
    waiting = current;
    service.textSearch({
      query: keyword.trim(),
      location: area.center,
      radius: Math.min(area.radiusKm * 1000, MAX_RADIUS_M),
      type: PLACE_TYPES[type],
    }, handlePage);
  };

  function handlePage(results, status, pagination) {
    const current = waiting;
    waiting = null;
    if (!current) return;
    page += 1;
    if (status === OK) {
      const places = toPlaces(results);
      // Nothing usable inside the circle on the first page: try the smarter search once
      if (!places.length && !pagination?.hasNextPage && request.keyword && !usedTextSearch) {
        textSearchFallback(current);
        return;
      }
      current.resolve({ places, loadMore: makeLoadMore(pagination, Date.now()) });
    } else if (status === ZERO_RESULTS) {
      if (request.keyword && !usedTextSearch && page === 1) {
        textSearchFallback(current);
        return;
      }
      current.resolve({ places: [], loadMore: null });
    } else {
      current.reject(new Error(STATUS_MESSAGES[status] || `無法載入地點（${status}）。`));
    }
  }

  return new Promise((resolve, reject) => {
    waiting = { resolve, reject };
    service.nearbySearch(request, handlePage);
  });
};

/**
 * Nearest match for a keyword when nothing is inside the circle, e.g. "陶板屋" with a 3 km radius.
 * Uses Text Search (searches by name, not limited to the radius) and returns the closest result.
 * @returns {Promise<{name, distanceKm}|null>}
 */
export const findNearest = (map, type, center, keyword) => {
  const { maps } = window.google;
  const service = new maps.places.PlacesService(map);
  return new Promise((resolve) => {
    service.textSearch(
      { query: keyword, location: center, radius: MAX_RADIUS_M, type: PLACE_TYPES[type] },
      (results, status) => {
        if (status !== maps.places.PlacesServiceStatus.OK || !results?.length) {
          resolve(null);
          return;
        }
        const nearest = results
          .filter((r) => r.geometry?.location && belongsTo(r.types, type))
          .map((r) => normalizePlace(r, type, center))
          .sort((a, b) => a.distanceKm - b.distanceKm)[0];
        resolve(nearest ? { name: nearest.name, distanceKm: nearest.distanceKm } : null);
      },
    );
  });
};

/** Reviews and contact info for one place (Place Details: billed, so only on demand). */
export const getPlaceDetails = (map, placeId) => {
  const { maps } = window.google;
  const service = new maps.places.PlacesService(map);
  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: ['reviews', 'url', 'formatted_phone_number', 'website'], // only what we show
      },
      (place, status) => {
        if (status === maps.places.PlacesServiceStatus.OK) {
          resolve({
            reviews: (place.reviews || []).map((r) => ({
              author: r.author_name,
              avatar: r.profile_photo_url,
              rating: r.rating,
              when: r.relative_time_description,
              text: r.text,
            })),
            url: place.url,
            phone: place.formatted_phone_number || null,
            website: place.website || null,
          });
        } else {
          reject(new Error(STATUS_MESSAGES[status] || `無法載入評論（${status}）。`));
        }
      },
    );
  });
};
