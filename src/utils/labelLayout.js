/**
 * Label collision handling for map markers.
 *
 * 1. Project every place from latitude/longitude to screen pixels at the current zoom
 *    (Web Mercator, EPSG:3857, the same projection Google Maps uses).
 * 2. Rank places by importance (rating weighted by number of reviews).
 * 3. Greedily place full "cards" in rank order, skipping any card whose box would
 *    overlap a card already placed.
 * 4. Places that didn't get a card become small "dots". Dots hidden under a card
 *    add to that card's "+N nearby" count. Dots that overlap each other are merged
 *    into numbered "clusters".
 *
 * Pure functions with no React or DOM, so they're easy to unit-test.
 */

const TILE_SIZE = 256;

/** Lat/lng -> world pixel coordinates at a zoom level (Web Mercator). */
export const project = (lat, lng, zoom) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
};

/** Importance: a 4.6 with 3,000 reviews outranks a 5.0 with 3 reviews. */
export const score = (place) => (place.rating || 0) * Math.log10((place.reviews || 0) + 1);

const overlaps = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

/**
 * @param {Array} places - normalized places ({ id, lat, lng, rating, reviews, ... })
 * @param {number} zoom
 * @param {object} options
 * @returns {{ cards: Array, dots: Array, clusters: Array }}
 *   cards:    [{ place, index, hiddenCount }]
 *   dots:     [{ place, index }]
 *   clusters: [{ id, lat, lng, count, indexes }]
 */
export const layoutLabels = (places, zoom, options = {}) => {
  const {
    cardWidth = 130, // marker card is ~120px wide; add a small gap
    cardHeight = 165,
    dotSize = 44, // dots (icon + rating, ~56px wide) closer than this are merged into a cluster
    maxCards = 8, // more cards than this is visual noise even if they don't overlap
    selectedIndex = null, // the place selected in the list always gets a card
  } = options;

  const ranked = places
    .map((place, index) => ({ place, index, ...project(place.lat, place.lng, zoom) }))
    .sort((a, b) => {
      if (a.index === selectedIndex) return -1;
      if (b.index === selectedIndex) return 1;
      return score(b.place) - score(a.place);
    });

  // Steps 3-4a: cards, greedily by rank
  const cards = [];
  const leftovers = [];
  ranked.forEach((item) => {
    const box = {
      x1: item.x - cardWidth / 2,
      x2: item.x + cardWidth / 2,
      y1: item.y - cardHeight / 2,
      y2: item.y + cardHeight / 2,
    };
    const fits = cards.length < maxCards && !cards.some((card) => overlaps(card.box, box));
    if (fits) cards.push({ ...item, box, hiddenCount: 0 });
    else leftovers.push(item);
  });

  // Step 4b: leftovers under a card are "hidden nearby"; the rest become dots
  const freeDots = [];
  leftovers.forEach((item) => {
    const coveringCard = cards.find(
      (card) => item.x >= card.box.x1 && item.x <= card.box.x2 && item.y >= card.box.y1 && item.y <= card.box.y2,
    );
    if (coveringCard) coveringCard.hiddenCount += 1;
    else freeDots.push(item);
  });

  // Step 4c: merge dots that overlap each other into clusters (greedy, by rank)
  const groups = [];
  freeDots.forEach((item) => {
    const group = groups.find((g) => Math.hypot(g.x - item.x, g.y - item.y) < dotSize);
    if (group) group.members.push(item);
    else groups.push({ x: item.x, y: item.y, members: [item] });
  });

  const dots = [];
  const clusters = [];
  groups.forEach((group) => {
    if (group.members.length === 1) {
      const [only] = group.members;
      dots.push({ place: only.place, index: only.index });
    } else {
      // Put the cluster at the average position of its members
      const n = group.members.length;
      clusters.push({
        id: group.members.map((m) => m.place.id).join('|'),
        lat: group.members.reduce((sum, m) => sum + m.place.lat, 0) / n,
        lng: group.members.reduce((sum, m) => sum + m.place.lng, 0) / n,
        count: n,
        indexes: group.members.map((m) => m.index),
      });
    }
  });

  return {
    cards: cards.map(({ place, index, hiddenCount }) => ({ place, index, hiddenCount })),
    dots,
    clusters,
  };
};
