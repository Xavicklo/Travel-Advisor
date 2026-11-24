import RestaurantIcon from '@material-ui/icons/Restaurant';
import LocalCafeIcon from '@material-ui/icons/LocalCafe';
import LocalBarIcon from '@material-ui/icons/LocalBar';
import CakeIcon from '@material-ui/icons/Cake';
import HotelIcon from '@material-ui/icons/Hotel';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';

/**
 * What a place is, decided from Google's `types` array.
 * Checked in order, so a more specific kind (cafe) wins over a general one (restaurant).
 */
export const KINDS = [
  { kind: 'lodging', label: '住宿', types: ['lodging'], Icon: HotelIcon, color: '#7b1fa2' },
  { kind: 'cafe', label: '咖啡廳', types: ['cafe'], Icon: LocalCafeIcon, color: '#795548' },
  { kind: 'bakery', label: '烘焙甜點', types: ['bakery'], Icon: CakeIcon, color: '#d81b60' },
  { kind: 'bar', label: '酒吧', types: ['bar', 'night_club'], Icon: LocalBarIcon, color: '#5e35b1' },
  { kind: 'restaurant', label: '餐廳', types: ['restaurant', 'meal_takeaway', 'meal_delivery', 'food'], Icon: RestaurantIcon, color: '#e65100' },
  {
    kind: 'attraction',
    label: '景點',
    types: ['tourist_attraction', 'museum', 'park', 'amusement_park', 'zoo', 'aquarium', 'art_gallery', 'place_of_worship'],
    Icon: PhotoCameraIcon,
    color: '#00897b',
  },
];

const byKind = Object.fromEntries(KINDS.map((k) => [k.kind, k]));

export const getKind = (kind) => byKind[kind] || byKind.restaurant;

/** Classify a place from its Google `types`, within the category the user asked for. */
export const classify = (types = [], category) => {
  if (category === 'hotels') return 'lodging';
  if (category === 'attractions') return 'attraction';
  const match = KINDS.find((k) => k.kind !== 'lodging' && k.kind !== 'attraction' && k.types.some((t) => types.includes(t)));
  return match ? match.kind : 'restaurant';
};

/**
 * Keep results in the category the user picked, e.g. a hotel that also has a
 * restaurant shouldn't show up under "restaurants".
 */
export const belongsTo = (types = [], category) => {
  const isLodging = types.includes('lodging');
  if (category === 'hotels') return isLodging;
  return !isLodging; // restaurants and attractions: no hotels
};

/** Quick food keywords shown as chips under the restaurant search box. */
export const FOOD_KEYWORDS = ['火鍋', '涼麵', '咖哩飯', '拉麵', '牛肉麵', '燒肉', '早午餐', '甜點', '咖啡'];
