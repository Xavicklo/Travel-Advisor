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
  if (code === 0) return { icon: isDay ? '☀️' : '🌙', text: '晴朗' };
  if (code <= 2) return { icon: isDay ? '🌤️' : '☁️', text: '多雲' };
  if (code === 3) return { icon: '☁️', text: '陰天' };
  if (code <= 48) return { icon: '🌫️', text: '霧' };
  if (code <= 67 || (code >= 80 && code <= 82)) return { icon: '🌧️', text: '下雨' };
  if (code <= 77 || code === 85 || code === 86) return { icon: '🌨️', text: '下雪' };
  if (code >= 95) return { icon: '⛈️', text: '雷雨' };
  return { icon: '🌡️', text: '未知' };
};
