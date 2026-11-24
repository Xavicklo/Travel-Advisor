# 🧭 Travel Advisor

Find restaurants, hotels and attractions in whatever area the map is showing, with ratings, photos, directions and live weather.

Built with **React 17**, **Material-UI** and the **Google Maps Platform**.

## Features

- Interactive Google Map with custom map styling
- **Area-based search:** pan or zoom the map, and the places shown in the visible area reload automatically
- Search any city or place with **Google Places Autocomplete**
- Filter by type (restaurants, hotels, attractions) and minimum rating
- **Distance slider (1–50 km):** searches a circle around the map centre, draws the circle on the map and zooms to fit it. Fetches up to 3 pages (60 places).
- **Search centre pin** fixed at the middle of the map (distances are measured from here) and a **"以我的位置搜尋"** button that moves the search to your GPS position, shown as a pulsing blue dot
- **No results? Nearest match:** if nothing matches inside the circle, a Text Search finds the closest match (e.g. the nearest 陶板屋) and offers "擴大範圍到 N 公里"
- **Recent searches and favourites** saved in the browser (localStorage): one click re-runs "麻辣鍋 · 3 公里 · 我的位置", and the ♥ on a card saves the place to the 我的收藏 tab. No account or database needed.
- **Sort** by recommended, highest rating, nearest or most reviewed; every card shows its distance (haversine)
- **Reviews on demand:** "查看評論" loads Google reviews, phone and website with Place Details, only when the user clicks
- **Food keyword search** (火鍋 hot pot, 涼麵 cold noodles, 咖哩飯 curry rice…): sent to Nearby Search as `keyword`, with quick chips
- **Category filtering and icons:** results are checked against Google's `types`, so a hotel with a restaurant doesn't appear under restaurants. Each place gets its own icon and colour (restaurant, café, bakery, bar, lodging, attraction) on the map and in the list
- **Smart labels (marker collision handling):** important places get full cards, the rest become rating dots, and dots that overlap merge into clusters (see below)
- Clicking a marker scrolls the list to that place
- One-click **directions in Google Maps**
- Live weather for the centre of the map (Open-Meteo, no key needed)
- Responsive layout: on phones the list stacks above the map and markers shrink to icons

## Smart labels: how marker collisions are handled

When 20 places are drawn as 120×150 px cards, they overlap and nothing is readable. `src/utils/labelLayout.js` fixes this every time the map moves:

1. **Project** each place's latitude/longitude to screen pixels at the current zoom, using Web Mercator (EPSG:3857), the projection Google Maps uses.
2. **Rank** places by `rating × log10(reviews + 1)`, so a 4.6★ place with 3,000 reviews beats a 5.0★ place with 3 reviews. The place selected in the list always ranks first.
3. **Place cards greedily** in rank order, skipping any card whose box overlaps one already placed (max 8 cards).
4. Places that didn't fit become **rating dots** (hover to preview the card). Dots hidden under a card show as "+N nearby" on that card. Dots that overlap each other merge into a numbered **cluster**; click a cluster to zoom in.

The map's **圖示 / 智慧卡片 / 全部卡片** toggle switches between icons only (default, the clicked place opens as a card), smart cards, and every place as a card (the original behaviour), to compare before and after.

## How the Google Maps Platform is used

| Google product | Where | What for |
| --- | --- | --- |
| **Maps JavaScript API** | `components/Map/Map.js` (via `google-map-react`) | Renders the map and applies the custom style JSON in `mapStyles.js`. The `onChange` event returns the visible bounds (north-east and south-west corners), and the app uses these to query places inside that box. |
| **Places API: Autocomplete** | `components/Header/Header.js` (via `@react-google-maps/api`) | Suggests places as you type. The chosen place's `geometry.location` re-centres the map. Only the `geometry` and `name` fields are requested, to keep Places API cost down. |
| **Places API: Nearby Search** | `api/places.js` (`PlacesService.nearbySearch`) | Finds restaurants (`restaurant`), hotels (`lodging`) or attractions (`tourist_attraction`) within `radius` of the map centre, optionally matching a `keyword` (e.g. 火鍋). Returns rating, review count, price level, address and photo, with up to 3 pages through `pagination.nextPage()`. Debounced while the map moves. |
| **Places API: Text Search** | `api/places.js` (`PlacesService.textSearch`) | Only when a keyword search finds nothing inside the circle: finds the closest match by name, so the app can suggest a bigger radius. |
| **Places API: Place Details** | `api/places.js` (`PlacesService.getDetails`) | Reviews, phone and website for one place. Requested only when the user opens the reviews, and only those `fields`, to keep cost down. |
| **Maps URLs** | `components/PlaceDetails/PlaceDetails.js` | The "Directions" button opens Google Maps navigation. It needs no API key and is not billed. |

> Earlier versions used the Travel Advisor API on RapidAPI. That endpoint (`list-in-boundary`) was retired, so place data now comes from Google Places as well. The whole app runs on one Google Maps Platform key.

## Getting started

Requires Node.js 18 or later.

```bash
cp .env.example .env     # then fill in your keys
npm install
npm start                # http://localhost:3000
```

### API key

| Variable | Where to get it |
| --- | --- |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/google/maps-apis). Enable **Maps JavaScript API** and **Places API**, and restrict the key to your HTTP referrers. |

> Keys in a front-end app are always visible to the browser, so **referrer restrictions** on the Google key are what protect it. The `.env` file only keeps keys out of git.
