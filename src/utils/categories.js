import RestaurantIcon from '@material-ui/icons/Restaurant';
import LocalCafeIcon from '@material-ui/icons/LocalCafe';
import LocalBarIcon from '@material-ui/icons/LocalBar';
import CakeIcon from '@material-ui/icons/Cake';
import HotelIcon from '@material-ui/icons/Hotel';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import LocalConvenienceStoreIcon from '@material-ui/icons/LocalConvenienceStore';

/**
 * What a place is, decided from Google's `types` array.
 * Checked in order, so a more specific kind (cafe) wins over a general one (restaurant).
 */
export const KINDS = [
  { kind: 'store', label: '便利商店', types: ['convenience_store'], Icon: LocalConvenienceStoreIcon, color: '#2e7d32' },
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
  if (category === 'stores') return 'store';
  if (category === 'hotels') return 'lodging';
  if (category === 'attractions') return 'attraction';
  const match = KINDS.find((k) => !['lodging', 'attraction', 'store'].includes(k.kind) && k.types.some((t) => types.includes(t)));
  return match ? match.kind : 'restaurant';
};

/**
 * Keep results in the category the user picked, e.g. a hotel that also has a
 * restaurant shouldn't show up under "restaurants".
 */
export const belongsTo = (types = [], category) => {
  const isLodging = types.includes('lodging');
  if (category === 'all') return true;
  if (category === 'hotels') return isLodging;
  if (category === 'stores') return !isLodging;
  // restaurants and attractions: no hotels, and no 7-11 under 餐廳
  return !isLodging && !types.includes('convenience_store');
};

/** Quick keywords shown as chips under the panel's search box, per category. */
export const QUICK_KEYWORDS = {
  stores: ['7-11', '全家', '萊爾富', 'OK超商'],
  restaurants: ['火鍋', '涼麵', '咖哩飯', '拉麵', '牛肉麵', '燒肉', '早午餐', '甜點', '咖啡'],
  hotels: ['汽車旅館', '民宿', '青年旅館', '商務旅館', '溫泉', '親子', '寵物友善'],
  attractions: ['夜市', '老街', '博物館', '公園', '步道', '觀景台', '寺廟', '親子景點'],
};

/** Placeholder text for the panel's search box, per category. */
export const KEYWORD_PLACEHOLDER = {
  restaurants: '想吃什麼？例如：火鍋、涼麵、咖哩飯',
  hotels: '想住哪種？例如：汽車旅館、民宿、溫泉',
  attractions: '想去哪玩？例如：夜市、老街、步道',
  stores: '找哪家？例如：7-11、全家',
  all: '想找什麼？例如：火鍋、7-11、民宿',
};

// Words that tell us what the user is looking for, for the header's all-in-one search
const STORE_WORDS = /(便利商店|超商|7-?11|7-?eleven|seven|小七|全家|family ?mart|萊爾富|hi-?life|ok超商|ok mart)/i;
const HOTEL_WORDS = /(旅館|旅店|飯店|酒店|民宿|住宿|青旅|背包客|膠囊|度假村|渡假村|villa|motel|hotel|hostel|inn|resort|b&b|airbnb)/i;
const ATTRACTION_WORDS = /(景點|夜市|老街|博物館|美術館|紀念館|公園|步道|古蹟|寺|廟|宮|教堂|動物園|水族館|遊樂園|樂園|觀景|瀑布|海灘|沙灘|老屋|商圈|museum|park|temple|night market|zoo)/i;

/**
 * Which category a free-text search belongs to: "火鍋" -> restaurants,
 * "motel" -> hotels, "夜市" -> attractions. Food is the default, since most
 * free-text searches are things to eat.
 */
export const detectCategory = (text) => {
  if (STORE_WORDS.test(text)) return 'stores';
  if (HOTEL_WORDS.test(text)) return 'hotels';
  if (ATTRACTION_WORDS.test(text)) return 'attractions';
  return 'restaurants';
};

// Words that mean "this is a place to go to", e.g. 台北車站, 忠孝東路, 信義區, 台大醫院
const PLACE_WORDS = /(路|街|巷|弄|號|段|區|市|縣|鄉|鎮|村|車站|火車站|高鐵|捷運|機場|大學|醫院|大樓|廣場|商圈|百貨|101|station|road|street|district|airport)/i;

/**
 * Does typed text look like an address or landmark (move the search centre there)
 * rather than something to look for (火鍋, 汽車旅館)? A quick keyword is never a place.
 */
export const looksLikePlace = (text) => {
  const t = text.trim();
  if (Object.values(QUICK_KEYWORDS).some((words) => words.includes(t))) return false;
  return PLACE_WORDS.test(t);
};

/**
 * Which convenience-store chain a place is, from its name, as a short text tag for the
 * marker (plain text in our own style, not the chains' logos).
 * @returns {string|null} '7' | '全' | '萊' | 'OK' | null
 */
// One colour per chain so they're easy to tell apart. Our own palette, deliberately not
// the chains' brand colours, and none of the category colours either.
export const CHAIN_COLORS = {
  7: { bg: '#283593', fg: '#fff' }, // indigo
  全: { bg: '#6d4c41', fg: '#fff' }, // brown
  萊: { bg: '#f9a825', fg: '#3e2723' }, // amber, dark text for contrast
  OK: { bg: '#455a64', fg: '#fff' }, // slate
};
const CHAINS = [
  [/7-?eleven|7-?11|統一超商|小七/i, '7'],
  [/全家|family ?mart/i, '全'],
  [/萊爾富|hi-?life/i, '萊'],
  [/ok ?(超商|mart)|^ok\b/i, 'OK'],
];
export const storeChain = (name = '') => {
  const hit = CHAINS.find(([re]) => re.test(name));
  return hit ? hit[1] : null;
};
