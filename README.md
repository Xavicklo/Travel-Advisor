# 🧭 Travel Advisor

Find restaurants, hotels and attractions in whatever area the map is showing, with ratings, photos, directions and live weather.

Built with **React 17**, **Material-UI** and the **Google Maps Platform**.

## Features

- Interactive Google Map with custom map styling
- **Area-based search:** pan or zoom the map, and the places shown in the visible area reload automatically
- Search any city or place with **Google Places Autocomplete**
- Filter by type (restaurants, hotels, attractions) and minimum rating
- Clicking a marker scrolls the list to that place
- One-click **directions in Google Maps**
- Live weather for the centre of the map (Open-Meteo, no key needed)
- Responsive layout: on phones the list stacks above the map and markers shrink to icons

## How the Google Maps Platform is used

| Google product | Where | What for |
| --- | --- | --- |
| **Maps JavaScript API** | `components/Map/Map.js` (via `google-map-react`) | Renders the map and applies the custom style JSON in `mapStyles.js`. The `onChange` event returns the visible bounds (north-east and south-west corners), and the app uses these to query places inside that box. |
| **Places API: Autocomplete** | `components/Header/Header.js` (via `@react-google-maps/api`) | Suggests places as you type. The chosen place's `geometry.location` re-centres the map. Only the `geometry` and `name` fields are requested, to keep Places API cost down. |
| **Maps URLs** | `components/PlaceDetails/PlaceDetails.js` | The "Directions" button opens Google Maps navigation. It needs no API key and is not billed. |

The place listings themselves come from the **Travel Advisor API on RapidAPI**, not from Google Places.

## Getting started

Requires Node.js 18 or later.

```bash
cp .env.example .env     # then fill in your keys
npm install
npm start                # http://localhost:3000
```

### API keys

| Variable | Where to get it |
| --- | --- |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/google/maps-apis). Enable **Maps JavaScript API** and **Places API**, and restrict the key to your HTTP referrers. |
| `REACT_APP_RAPIDAPI_KEY` | [RapidAPI: Travel Advisor](https://rapidapi.com/apidojo/api/travel-advisor). Subscribe to the free plan. |

> Keys in a front-end app are always visible to the browser, so **referrer restrictions** on the Google key are what protect it. The `.env` file only keeps keys out of git.
