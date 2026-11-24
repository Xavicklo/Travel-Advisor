import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Typography,
  MenuItem,
  FormControl,
  Select,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Slider,
  Button,
  Tabs,
  Tab,
} from '@material-ui/core';
import HistoryIcon from '@material-ui/icons/History';
import FavoriteIcon from '@material-ui/icons/Favorite';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RestaurantIcon from '@material-ui/icons/Restaurant';
import HotelIcon from '@material-ui/icons/Hotel';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';

import PlaceDetails from '../PlaceDetails/PlaceDetails';
import PlaceRow from '../PlaceRow/PlaceRow';
import { FOOD_KEYWORDS } from '../../utils/categories';
import {
  RADIUS_STEPS, formatRadius, shortRadius, indexForRadius, nextRadiusCovering,
} from '../../utils/radius';
import useStyles from './styles';

// Smallest radius step that reaches the nearest match (and is bigger than the current one).
const expandTo = (nearest, radiusKm) => nextRadiusCovering(nearest.distanceKm, radiusKm);

// Distance slider marks: label only a few steps so they don't overlap in the narrow panel
const RADIUS_MARKS = [0.1, 1, 10, 50].map((km) => ({ value: indexForRadius(km), label: shortRadius(km) }));
// Rating slider: 0 means no minimum ("不限"), then 1-5 stars in half-star steps
const RATING_MARKS = [{ value: 0, label: '不限' }, { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' }];
const formatRating = (value) => (value ? `${value} 星以上` : '不限');

const TYPES = [
  { value: 'restaurants', label: '餐廳', Icon: RestaurantIcon },
  { value: 'hotels', label: '住宿', Icon: HotelIcon },
  { value: 'attractions', label: '景點', Icon: PhotoCameraIcon },
];

/**
 * Content of the floating side panel (bottom sheet on phones), like Google Maps:
 * filters + compact result rows, or the details of the selected place.
 */
const List = ({
  places,
  type,
  setType,
  keyword,
  setKeyword,
  rating,
  setRating,
  radiusKm,
  setRadiusKm,
  sortBy,
  setSortBy,
  selectedPlace,
  onSelectPlace,
  onBack,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  error,
  loadDetails,
  nearest,
  recentSearches = [],
  onApplySearch,
  onRemoveSearch,
  favorites = [],
  favoriteIds,
  onToggleFavorite,
  onSelectFavorite,
}) => {
  const classes = useStyles();
  const [draft, setDraft] = useState(keyword); // what's typed; applied on Enter or chip click
  // Slider positions while dragging. The distance slider moves over step indexes (see utils/radius.js).
  const [radiusIndex, setRadiusIndex] = useState(indexForRadius(radiusKm));
  const [ratingDraft, setRatingDraft] = useState(rating);
  const [tab, setTab] = useState('results'); // results | favorites

  useEffect(() => setDraft(keyword), [keyword]);
  useEffect(() => setRadiusIndex(indexForRadius(radiusKm)), [radiusKm]);
  useEffect(() => setRatingDraft(rating), [rating]);

  const applyKeyword = (value) => setKeyword(value.trim());

  const changeType = (value) => {
    setType(value);
    if (value !== 'restaurants') setKeyword(''); // food keywords only make sense for restaurants
  };

  // ---- Details of one place (replaces the list, like Google Maps) ----
  if (selectedPlace) {
    return (
      <div>
        <div className={classes.detailBar}>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} color="primary">
            返回結果
          </Button>
        </div>
        <PlaceDetails
          key={selectedPlace.id}
          place={selectedPlace}
          loadDetails={loadDetails}
          isFavorite={favoriteIds?.has(selectedPlace.id)}
          onToggleFavorite={onToggleFavorite}
          variant="panel"
        />
      </div>
    );
  }

  return (
    <div>
      <div className={classes.filters}>
        {/* Category: segmented chips */}
        <div className={classes.typeRow}>
          {TYPES.map(({ value, label, Icon }) => (
            <Chip
              key={value}
              icon={<Icon style={{ fontSize: 18 }} />}
              label={label}
              clickable
              color={type === value ? 'primary' : 'default'}
              variant={type === value ? 'default' : 'outlined'}
              onClick={() => changeType(value)}
              className={classes.typeChip}
            />
          ))}
        </div>

        {type === 'restaurants' && (
          <>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="想吃什麼？例如：火鍋、涼麵、咖哩飯"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyKeyword(draft);
              }}
              InputProps={{
                className: classes.keywordInput,
                endAdornment: (
                  <InputAdornment position="end">
                    {draft && (
                      <IconButton size="small" aria-label="清除" onClick={() => applyKeyword('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" aria-label="搜尋" onClick={() => applyKeyword(draft)}>
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <div className={classes.chips}>
              {FOOD_KEYWORDS.map((word) => (
                <Chip
                  key={word}
                  label={word}
                  size="small"
                  clickable
                  color={keyword === word ? 'primary' : 'default'}
                  onClick={() => applyKeyword(keyword === word ? '' : word)}
                />
              ))}
            </div>
            {/* Recent keyword searches (saved in the browser): one click restores place, radius and keyword */}
            {recentSearches.length > 0 && (
              <div className={classes.recent}>
                <Typography variant="caption" color="textSecondary" className={classes.recentTitle}>
                  <HistoryIcon fontSize="inherit" /> 最近搜尋
                </Typography>
                <div className={classes.chips}>
                  {recentSearches.map((search) => (
                    <Chip
                      key={search.id}
                      size="small"
                      variant="outlined"
                      color="primary"
                      clickable
                      label={`${search.keyword} · ${formatRadius(search.radiusKm)} · ${search.label}`}
                      onClick={() => onApplySearch(search)}
                      onDelete={() => onRemoveSearch(search.id)}
                      className={classes.recentChip}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Two sliders side by side: distance (searches) and minimum rating (filters instantly) */}
        <div className={classes.sliders}>
          <div>
            <Typography variant="body2" className={classes.sliderLabel}>
              範圍 <strong>{formatRadius(RADIUS_STEPS[radiusIndex])}</strong>
            </Typography>
            <Slider
              value={radiusIndex}
              min={0}
              max={RADIUS_STEPS.length - 1}
              step={1}
              marks={RADIUS_MARKS}
              valueLabelDisplay="auto"
              valueLabelFormat={(i) => shortRadius(RADIUS_STEPS[i])}
              onChange={(e, i) => setRadiusIndex(i)} // move the thumb smoothly...
              onChangeCommitted={(e, i) => setRadiusKm(RADIUS_STEPS[i])} // ...but only search when released
              aria-label="搜尋範圍"
              className={classes.slider}
            />
          </div>
          <div>
            <Typography variant="body2" className={classes.sliderLabel}>
              評分 <strong>{formatRating(ratingDraft)}</strong>
            </Typography>
            <Slider
              value={ratingDraft}
              min={0}
              max={5}
              step={0.5}
              marks={RATING_MARKS}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => (v ? `${v}★` : '不限')}
              onChange={(e, v) => setRatingDraft(v)}
              onChangeCommitted={(e, v) => setRating(v)} // filtering is local, no API call
              aria-label="最低評分"
              className={`${classes.slider} ${classes.ratingSlider}`}
            />
          </div>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={(e, value) => setTab(value)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        className={classes.tabs}
      >
        <Tab value="results" label="搜尋結果" className={classes.tab} />
        <Tab value="favorites" label={`收藏（${favorites.length}）`} icon={<FavoriteIcon fontSize="small" />} className={`${classes.tab} ${classes.favTab}`} />
      </Tabs>

      {tab === 'favorites' && (
        <>
          {favorites.length === 0 && (
            <Typography color="textSecondary" className={classes.message}>
              還沒有收藏。在店家右上角按 ♥ 就會存在這裡，下次可以直接選。
            </Typography>
          )}
          {favorites.map((place) => (
            <PlaceRow
              key={place.id}
              place={place}
              onSelect={onSelectFavorite}
              isFavorite
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </>
      )}

      {tab === 'results' && (isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {error && <Typography color="error" className={classes.message}>{error}</Typography>}
          {!error && places.length === 0 && (
            <Typography color="textSecondary" className={classes.message}>
              {keyword
                ? `${formatRadius(radiusKm)}內沒有找到「${keyword}」。`
                : '這個範圍內沒有找到地點，試著移動地圖或調整篩選條件。'}
            </Typography>
          )}
          {/* Suggest the nearest match outside the circle, with a one-click bigger radius */}
          {!error && places.length === 0 && keyword && nearest && (
            <div className={classes.nearestBox}>
              <Typography variant="body2">
                最近的「{keyword}」是 <strong>{nearest.name}</strong>，距離約 <strong>{nearest.distanceKm.toFixed(1)} 公里</strong>。
              </Typography>
              {expandTo(nearest, radiusKm) && (
                <Button variant="outlined" color="primary" size="small" className={classes.expandButton} onClick={() => setRadiusKm(expandTo(nearest, radiusKm))}>
                  擴大範圍到 {formatRadius(expandTo(nearest, radiusKm))}
                </Button>
              )}
            </div>
          )}
          {!error && places.length > 0 && (
            <div className={classes.resultBar}>
              <Typography variant="body2" color="textSecondary">
                {formatRadius(radiusKm)}內 {places.length} 個{keyword ? `「${keyword}」` : ''}結果
              </Typography>
              <FormControl size="small">
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} disableUnderline className={classes.sort}>
                  <MenuItem value="recommended">推薦排序</MenuItem>
                  <MenuItem value="rating">評分最高</MenuItem>
                  <MenuItem value="distance">距離最近</MenuItem>
                  <MenuItem value="reviews">評論最多</MenuItem>
                </Select>
              </FormControl>
            </div>
          )}

          {places.map((place) => (
            <PlaceRow
              key={place.id}
              place={place}
              onSelect={onSelectPlace}
              isFavorite={favoriteIds?.has(place.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}

          {/* Next page only on request: each page is a billed Places API call */}
          {!error && hasMore && (
            <div className={classes.loadMore}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                startIcon={isLoadingMore ? <CircularProgress size={16} /> : null}
              >
                {isLoadingMore ? '載入中…' : '載入更多結果'}
              </Button>
            </div>
          )}
        </>
      ))}
    </div>
  );
};

export default List;
