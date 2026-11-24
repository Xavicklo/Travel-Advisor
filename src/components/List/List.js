import React, { useState, useEffect, createRef } from 'react';
import {
  CircularProgress,
  Grid,
  Typography,
  InputLabel,
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
import MyLocationIcon from '@material-ui/icons/MyLocation';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import PlaceDetails from '../PlaceDetails/PlaceDetails';
import { FOOD_KEYWORDS } from '../../utils/categories';
import {
  RADIUS_STEPS, formatRadius, shortRadius, indexForRadius, nextRadiusCovering,
} from '../../utils/radius';
import useStyles from './styles';

// Smallest whole-km radius that reaches the nearest match (and is bigger than the current one).
const expandTo = (nearest, radiusKm) => nextRadiusCovering(nearest.distanceKm, radiusKm);

// Distance slider marks: label only a few steps so they don't overlap
const RADIUS_MARKS = [0.1, 1, 5, 20, 50].map((km) => ({ value: indexForRadius(km), label: shortRadius(km) }));
// Rating slider: 0 means no minimum ("不限"), then 1-5 stars in half-star steps
const RATING_MARKS = [
  { value: 0, label: '不限' }, { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
];
const formatRating = (value) => (value ? `${value} 星以上` : '不限');

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
  childClicked,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  error,
  loadDetails,
  nearest,
  onLocate,
  locating,
  locateError,
  recentSearches = [],
  onApplySearch,
  onRemoveSearch,
  favorites = [],
  favoriteIds,
  onToggleFavorite,
  onShowOnMap,
}) => {
  const [elRefs, setElRefs] = useState([]);
  const [draft, setDraft] = useState(keyword); // what's typed; applied on Enter or chip click
  // Slider positions while dragging. The distance slider moves over step indexes (see utils/radius.js).
  const [radiusIndex, setRadiusIndex] = useState(indexForRadius(radiusKm));
  const [ratingDraft, setRatingDraft] = useState(rating);
  const [tab, setTab] = useState('results'); // results | favorites
  const classes = useStyles();

  useEffect(() => {
    setElRefs((refs) => Array(places.length).fill().map((_, i) => refs[i] || createRef()));
  }, [places]);

  useEffect(() => setDraft(keyword), [keyword]);
  useEffect(() => setRadiusIndex(indexForRadius(radiusKm)), [radiusKm]);
  useEffect(() => setRatingDraft(rating), [rating]);

  const applyKeyword = (value) => setKeyword(value.trim());

  const changeType = (value) => {
    setType(value);
    if (value !== 'restaurants') setKeyword(''); // food keywords only make sense for restaurants
  };

  return (
    <div className={classes.container}>
      <Typography variant="h6">探索附近好去處</Typography>

      <FormControl className={classes.formControl}>
        <InputLabel id="type">類別</InputLabel>
        <Select id="type" value={type} onChange={(e) => changeType(e.target.value)}>
          <MenuItem value="restaurants">餐廳</MenuItem>
          <MenuItem value="hotels">住宿</MenuItem>
          <MenuItem value="attractions">景點</MenuItem>
        </Select>
      </FormControl>
      <div className={classes.radiusBox}>
        {/* Two sliders side by side: distance (searches) and minimum rating (filters instantly) */}
        <div className={classes.sliders}>
          <div>
            <Typography variant="body2" className={classes.radiusLabel}>
              搜尋範圍：<strong>{formatRadius(RADIUS_STEPS[radiusIndex])}</strong>
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
            <Typography variant="body2" className={classes.radiusLabel}>
              評分：<strong>{formatRating(ratingDraft)}</strong>
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
        <Typography variant="caption" className={classes.radiusHint} component="div">
          以紅色「搜尋中心」圖釘為圓心；評分篩選不會重新查詢
        </Typography>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          startIcon={locating ? <CircularProgress size={16} color="inherit" /> : <MyLocationIcon />}
          onClick={onLocate}
          disabled={locating}
          className={classes.locateButton}
        >
          {locating ? '定位中…' : '以我的位置搜尋'}
        </Button>
        {locateError && (
          <Typography variant="caption" color="error" component="div" className={classes.locateError}>
            {locateError}
          </Typography>
        )}
      </div>

      {type === 'restaurants' && (
        <div className={classes.keywordBox}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="想吃什麼？"
            placeholder="例如：火鍋、涼麵、咖哩飯"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyKeyword(draft);
            }}
            InputProps={{
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
        </div>
      )}

      <Tabs
        value={tab}
        onChange={(e, value) => setTab(value)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        className={classes.tabs}
      >
        <Tab value="results" label="搜尋結果" />
        <Tab value="favorites" label={`我的收藏（${favorites.length}）`} icon={<FavoriteIcon fontSize="small" />} className={classes.favTab} />
      </Tabs>

      {tab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            <Typography color="textSecondary" className={classes.message}>
              還沒有收藏。在店家卡片上按 ♥ 就會存在這裡，下次可以直接選。
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary" className={classes.message}>
              共 {favorites.length} 個收藏，距離以目前的搜尋中心計算
            </Typography>
          )}
          <Grid container spacing={3} className={classes.list}>
            {favorites.map((place) => (
              <Grid key={place.id} item xs={12}>
                <PlaceDetails
                  place={place}
                  loadDetails={loadDetails}
                  isFavorite
                  onToggleFavorite={onToggleFavorite}
                  onShowOnMap={onShowOnMap}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {tab === 'results' && (isLoading ? (
        <div className={classes.loading}>
          <CircularProgress size="4rem" />
        </div>
      ) : (
        <>
          {error && (
            <Typography color="error" className={classes.message}>
              {error}
            </Typography>
          )}
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
                最近的「{keyword}」是 <strong>{nearest.name}</strong>，
                距離約 <strong>{nearest.distanceKm.toFixed(1)} 公里</strong>。
              </Typography>
              {expandTo(nearest, radiusKm) && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  className={classes.expandButton}
                  onClick={() => setRadiusKm(expandTo(nearest, radiusKm))}
                >
                  擴大範圍到 {formatRadius(expandTo(nearest, radiusKm))}
                </Button>
              )}
            </div>
          )}
          {!error && places.length > 0 && (
            <div className={classes.resultBar}>
              <Typography variant="body2" color="textSecondary">
                {formatRadius(radiusKm)}內找到 {places.length} 個{keyword ? `「${keyword}」` : ''}結果
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

          <Grid container spacing={3} className={classes.list}>
            {places.map((place, i) => (
              <Grid ref={elRefs[i]} key={place.id} item xs={12}>
                <PlaceDetails
                  selected={childClicked === i}
                  refProp={elRefs[i]}
                  place={place}
                  loadDetails={loadDetails}
                  isFavorite={favoriteIds?.has(place.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </Grid>
            ))}
            {/* Next page only on request: each page is a billed Places API call */}
            {!error && hasMore && (
              <Grid item xs={12}>
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
              </Grid>
            )}
          </Grid>
        </>
      ))}
    </div>
  );
};

export default List;
