import axios from 'axios';

// Keys come from .env (see .env.example). They are never committed to git.
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;

/**
 * Places (restaurants / hotels / attractions) inside the visible map area.
 * The map's bounding box (south-west + north-east corners) is sent to the
 * Travel Advisor API on RapidAPI.
 * Throws an Error with a user-friendly message on failure.
 */
export const getPlacesData = async (type, sw, ne, { signal } = {}) => {
  if (!RAPIDAPI_KEY) {
    throw new Error('Missing REACT_APP_RAPIDAPI_KEY. Add it to your .env file.');
  }

  try {
    const {
      data: { data },
    } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-in-boundary`, {
      params: {
        bl_latitude: sw.lat,
        bl_longitude: sw.lng,
        tr_longitude: ne.lng,
        tr_latitude: ne.lat,
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
      },
      signal,
      timeout: 15000,
    });

    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      throw new Error('RapidAPI key is invalid or not subscribed to the Travel Advisor API.');
    }
    if (status === 429) throw new Error('RapidAPI rate limit reached. Please try again later.');
    throw new Error('Could not load places. Please try again.');
  }
};

/**
 * Current weather at a point from Open-Meteo (free, no API key).
 * Returns null if the weather can't be loaded, since weather is optional.
 */
export const getWeatherData = async (lat, lng) => {
  if (lat == null || lng == null) return null;
  try {
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat.toFixed(3),
        longitude: lng.toFixed(3),
        current: 'temperature_2m,weather_code,is_day',
        timezone: 'auto',
      },
      timeout: 8000,
    });
    return data.current;
  } catch (error) {
    return null;
  }
};

/** WMO weather code -> emoji + short label. */
export const describeWeather = (code, isDay = 1) => {
  if (code === 0) return { icon: isDay ? '☀️' : '🌙', text: 'Clear' };
  if (code <= 2) return { icon: isDay ? '🌤️' : '☁️', text: 'Partly cloudy' };
  if (code === 3) return { icon: '☁️', text: 'Overcast' };
  if (code <= 48) return { icon: '🌫️', text: 'Fog' };
  if (code <= 67 || (code >= 80 && code <= 82)) return { icon: '🌧️', text: 'Rain' };
  if (code <= 77 || code === 85 || code === 86) return { icon: '🌨️', text: 'Snow' };
  if (code >= 95) return { icon: '⛈️', text: 'Thunderstorm' };
  return { icon: '🌡️', text: 'Unknown' };
};
