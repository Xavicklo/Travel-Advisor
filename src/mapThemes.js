import lightStyles from './mapStyles';

/**
 * Base map choices for the 圖層 (layers) button.
 * All of them are the same "Dynamic Maps" load in Google's billing, so switching costs nothing extra.
 * Google's own POI icons are hidden everywhere so they don't clash with our markers.
 */
const hidePoi = [
  { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

const nightStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1d2433' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2433' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a96a8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d0d6e0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2f3a4d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2130' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9aa6b8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#55627a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f1a2b' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e5d73' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#202a3a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2a3446' }] },
  ...hidePoi,
];

// swatch: the little preview tile in the picker (CSS background)
const MAP_THEMES = [
  {
    id: 'light', label: '淺色', mapTypeId: 'roadmap', styles: lightStyles,
    swatch: 'linear-gradient(135deg, #f2f2f2 0 55%, #ffffff 55% 62%, #46bcec 62%)',
  },
  {
    id: 'standard', label: '標準', mapTypeId: 'roadmap', styles: hidePoi,
    swatch: 'linear-gradient(135deg, #e8eaed 0 45%, #fde293 45% 52%, #e8eaed 52% 70%, #aadaff 70%)',
  },
  {
    id: 'hybrid', label: '衛星', mapTypeId: 'hybrid', styles: hidePoi, recommended: true,
    swatch: 'linear-gradient(135deg, #3d5a3a 0 30%, #6b7b5a 30% 50%, #fff 50% 53%, #2f4a3c 53% 75%, #1f3b5c 75%)',
  },
  {
    id: 'terrain', label: '地形', mapTypeId: 'terrain', styles: hidePoi,
    swatch: 'linear-gradient(135deg, #cfe3c3 0 35%, #b9d3a8 35% 60%, #e9e3d3 60% 80%, #aadaff 80%)',
  },
  {
    id: 'night', label: '夜間', mapTypeId: 'roadmap', styles: nightStyles,
    swatch: 'linear-gradient(135deg, #1d2433 0 50%, #55627a 50% 56%, #1d2433 56% 75%, #0f1a2b 75%)',
  },
];

export const getTheme = (id) => MAP_THEMES.find((t) => t.id === id) || MAP_THEMES[0];

export default MAP_THEMES;
