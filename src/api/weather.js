/**
 * Current weather at a point from Open-Meteo (free, no API key).
 * Returns null on failure: the weather badge is optional.
 */
export const getWeatherData = async (lat, lng) => {
  if (lat == null || lng == null) return null;
  const params = new URLSearchParams({
    latitude: lat.toFixed(3),
    longitude: lng.toFixed(3),
    current: 'temperature_2m,weather_code,is_day',
    timezone: 'auto',
  });
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
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
