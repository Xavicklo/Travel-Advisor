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
    dotSize = 26, // icons (~26px circles) closer than this overlap, so they're merged into a cluster
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
    // The selected place always gets a card; the rest only if there's room
    const isSelected = item.index === selectedIndex;
    const fits = isSelected || (cards.length < maxCards && !cards.some((card) => overlaps(card.box, box)));
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

/**
 * Zoom-responsive marker labels, like Google Maps:
 *   level 0 = icon only, level 1 = icon + rating, level 2 = icon + rating + name.
 * The level comes from the zoom (or the mode the user picked). A label that would
 * cover another marker or label is shortened (name dropped, then rating) instead
 * of overlapping. Dots arrive in rank order, so the best places get labels first.
 */
export const LABEL_ZOOM = { rating: 15, name: 16 };
const ICON = 28; // icon circle incl. padding, px
const LABEL_H = 28;
const MAX_NAME_CHARS = 10;

export const zoomLevel = (zoom, mode = 'auto') => {
  if (mode === 'icons') return 0;
  if (mode === 'names') return 2;
  if (zoom >= LABEL_ZOOM.name) return 2;
  if (zoom >= LABEL_ZOOM.rating) return 1;
  return 0;
};

/** Rough pixel width of a label (CJK characters ~13px at 12px font). */
export const labelWidth = (place, level) => {
  let w = ICON;
  if (level >= 1 && place.rating) w += 38;
  if (level >= 2) w += Math.min(place.name.length, MAX_NAME_CHARS) * 12.5 + 10;
  return w;
};

/**
 * @param {Array<{place, index}>} dots - in rank order (from layoutLabels)
 * @param {Array} clusters - from layoutLabels, treated as obstacles
 * @returns {Object<number, number>} label level by place index
 */
export const labelLevels = (dots, clusters, zoom, mode = 'auto') => {
  const wanted = zoomLevel(zoom, mode);
  const levels = {};
  if (wanted === 0) {
    dots.forEach((d) => { levels[d.index] = 0; });
    return levels;
  }
  const pts = dots.map((d) => ({ ...d, ...project(d.place.lat, d.place.lng, zoom) }));
  const iconBox = (p) => ({ x1: p.x - ICON / 2, x2: p.x + ICON / 2, y1: p.y - ICON / 2, y2: p.y + ICON / 2 });
  // Other markers are obstacles: a label must not cover another icon or a cluster
  const obstacles = pts.map((p) => ({ index: p.index, box: iconBox(p) }));
  clusters.forEach((c) => {
    const p = project(c.lat, c.lng, zoom);
    obstacles.push({ index: -1, box: { x1: p.x - 32, x2: p.x + 32, y1: p.y - 14, y2: p.y + 14 } });
  });
  const placed = [];
  pts.forEach((p) => {
    let level = wanted;
    while (level > 0) {
      const box = { x1: p.x - ICON / 2, x2: p.x - ICON / 2 + labelWidth(p.place, level), y1: p.y - LABEL_H / 2, y2: p.y + LABEL_H / 2 };
      const blocked = placed.some((b) => overlaps(b, box))
        || obstacles.some((o) => o.index !== p.index && overlaps(o.box, box));
      if (!blocked) { placed.push(box); break; }
      level -= 1;
    }
    levels[p.index] = level;
  });
  return levels;
};

export const shortName = (name) => (name.length > MAX_NAME_CHARS ? `${name.slice(0, MAX_NAME_CHARS)}…` : name);
