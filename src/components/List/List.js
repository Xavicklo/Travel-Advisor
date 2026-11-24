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
  ButtonBase,
} from '@material-ui/core';
import HistoryIcon from '@material-ui/icons/History';
import FavoriteIcon from '@material-ui/icons/Favorite';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RestaurantIcon from '@material-ui/icons/Restaurant';
import HotelIcon from '@material-ui/icons/Hotel';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import RoomIcon from '@material-ui/icons/Room';
import StarIcon from '@material-ui/icons/Star';

import PlaceDetails from '../PlaceDetails/PlaceDetails';
import PlaceRow from '../PlaceRow/PlaceRow';
import { KEYWORD_PLACEHOLDER } from '../../utils/categories';
import {
  RADIUS_STEPS, formatRadius, shortRadius, indexForRadius, nextRadiusCovering,
} from '../../utils/radius';
import { RATING_STEPS, indexForRating } from '../../utils/rating';
import useStyles from './styles';

// Smallest radius step that reaches the nearest match (and is bigger than the current one).
const expandTo = (nearest, radiusKm) => nextRadiusCovering(nearest.distanceKm, radiusKm);

// Slider marks: label only a few steps so they don't overlap
const RADIUS_MARKS = [0.1, 0.5, 1, 3, 10, 50].map((km) => ({ value: indexForRadius(km), label: shortRadius(km) }));
// 不限 and 3 are neighbours, so only 不限 gets a text label there to avoid overlap
const RATING_MARKS = [
  { value: indexForRating(0), label: '不限' },
  { value: indexForRating(3) },
  ...[4, 4.5, 4.9].map((stars) => ({ value: indexForRating(stars), label: `${stars}` })),
];

// Big round slider knobs with an icon, easy to grab with a thumb on a phone.
// MUI passes the value bubble as children, so keep rendering them.
function RadiusThumb(props) {
  return (
    <span {...props}>
      <RoomIcon style={{ fontSize: 18, color: '#4a6382' }} />
      {props.children}
    </span>
  );
}
function RatingThumb(props) {
  return (
    <span {...props}>
      <StarIcon style={{ fontSize: 18, color: '#f5a623' }} />
      {props.children}
    </span>
  );
}

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
  recentKeywords = [],
  onRemoveKeyword,
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
  const [ratingIndex, setRatingIndex] = useState(indexForRating(rating)); // rating slider also moves over steps
  const [tab, setTab] = useState('results'); // results | favorites
  const [sliderTab, setSliderTab] = useState('radius'); // which filter slider is showing

  useEffect(() => setDraft(keyword), [keyword]);
  useEffect(() => setRadiusIndex(indexForRadius(radiusKm)), [radiusKm]);
  useEffect(() => setRatingIndex(indexForRating(rating)), [rating]);

  const applyKeyword = (value) => setKeyword(value.trim());

  const changeType = (value) => {
    setType(value);
    setKeyword(''); // each category has its own keywords (火鍋 means nothing for hotels)
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

        {/* Keyword search for every category: food, kinds of stay, kinds of sights */}
        <>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={KEYWORD_PLACEHOLDER[type]}
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
            {/* The user's own last 3 keywords for this category (saved in the browser) */}
            {recentKeywords.length > 0 && (
              <div className={classes.chips}>
                <HistoryIcon fontSize="small" color="disabled" />
                {recentKeywords.map((word) => (
                  <Chip
                    key={word}
                    label={word}
                    size="small"
                    clickable
                    color={keyword === word ? 'primary' : 'default'}
                    onClick={() => applyKeyword(keyword === word ? '' : word)}
                    onDelete={() => onRemoveKeyword(word)}
                  />
                ))}
              </div>
            )}
        </>

        {/* Range and rating as browser-style tabs: only the chosen slider is shown, saving space */}
        <div className={classes.filterTabs}>
          <div className={classes.tabStrip} role="tablist">
            <ButtonBase
              role="tab"
              aria-selected={sliderTab === 'radius'}
              className={`${classes.filterTab} ${sliderTab === 'radius' ? classes.filterTabActive : ''}`}
              onClick={() => setSliderTab('radius')}
            >
              <RoomIcon className={classes.filterTabIcon} style={{ color: '#4a6382' }} />
              範圍 <strong>{shortRadius(RADIUS_STEPS[radiusIndex])}</strong>
            </ButtonBase>
            <ButtonBase
              role="tab"
              aria-selected={sliderTab === 'rating'}
              className={`${classes.filterTab} ${sliderTab === 'rating' ? classes.filterTabActive : ''}`}
              onClick={() => setSliderTab('rating')}
            >
              <StarIcon className={classes.filterTabIcon} style={{ color: '#f5a623' }} />
              評分 <strong>{RATING_STEPS[ratingIndex] ? `${RATING_STEPS[ratingIndex]}★+` : '不限'}</strong>
            </ButtonBase>
          </div>
          {/* Square top corner under the active tab, so tab and panel read as one shape */}
          <div
            className={classes.sliders}
            role="tabpanel"
            style={{ borderTopLeftRadius: sliderTab === 'radius' ? 0 : 14, borderTopRightRadius: sliderTab === 'rating' ? 0 : 14 }}
          >
            {sliderTab === 'radius' ? (
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
                ThumbComponent={RadiusThumb}
                className={classes.slider}
              />
            ) : (
              <Slider
                value={ratingIndex}
                min={0}
                max={RATING_STEPS.length - 1}
                step={1}
                marks={RATING_MARKS}
                valueLabelDisplay="auto"
                valueLabelFormat={(i) => (RATING_STEPS[i] ? `${RATING_STEPS[i]}★` : '不限')}
                onChange={(e, i) => setRatingIndex(i)}
                onChangeCommitted={(e, i) => setRating(RATING_STEPS[i])} // filtering is local, no API call
                aria-label="最低評分"
                ThumbComponent={RatingThumb}
                className={`${classes.slider} ${classes.ratingSlider}`}
              />
            )}
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
