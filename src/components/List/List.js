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
  LinearProgress,
  Button,
} from '@material-ui/core';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import PlaceDetails from '../PlaceDetails/PlaceDetails';
import { FOOD_KEYWORDS } from '../../utils/categories';
import useStyles from './styles';

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
  error,
  loadDetails,
  onLocate,
  locating,
  locateError,
}) => {
  const [elRefs, setElRefs] = useState([]);
  const [draft, setDraft] = useState(keyword); // what's typed; applied on Enter or chip click
  const [radiusDraft, setRadiusDraft] = useState(radiusKm); // slider position while dragging
  const classes = useStyles();

  useEffect(() => {
    setElRefs((refs) => Array(places.length).fill().map((_, i) => refs[i] || createRef()));
  }, [places]);

  useEffect(() => setDraft(keyword), [keyword]);
  useEffect(() => setRadiusDraft(radiusKm), [radiusKm]);

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
      <FormControl className={classes.formControl}>
        <InputLabel id="rating">評分</InputLabel>
        <Select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
          <MenuItem value="">全部</MenuItem>
          <MenuItem value="2">2 星以上</MenuItem>
          <MenuItem value="3">3 星以上</MenuItem>
          <MenuItem value="4">4 星以上</MenuItem>
          <MenuItem value="4.5">4.5 星以上</MenuItem>
        </Select>
      </FormControl>

      {/* Distance slider: search radius around the map centre (drawn as a circle on the map) */}
      <div className={classes.radiusBox}>
        <Typography variant="body2" className={classes.radiusLabel}>
          搜尋範圍：<strong>{radiusDraft} 公里</strong>
          <span className={classes.radiusHint}>（以地圖中心為圓心）</span>
        </Typography>
        <Slider
          value={radiusDraft}
          min={1}
          max={50}
          step={1}
          marks={[1, 5, 10, 20, 30, 50].map((v) => ({ value: v, label: `${v}` }))}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${v}km`}
          onChange={(e, v) => setRadiusDraft(v)} // move the thumb smoothly...
          onChangeCommitted={(e, v) => setRadiusKm(v)} // ...but only search when the user lets go
          aria-label="搜尋範圍（公里）"
        />
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

      {isLoading ? (
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
                ? `這個範圍內沒有找到「${keyword}」，試著移動地圖或換個關鍵字。`
                : '這個範圍內沒有找到地點，試著移動地圖或調整篩選條件。'}
            </Typography>
          )}
          {!error && places.length > 0 && (
            <div className={classes.resultBar}>
              <Typography variant="body2" color="textSecondary">
                {radiusKm} 公里內找到 {places.length} 個{keyword ? `「${keyword}」` : ''}結果
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
          {!error && isLoadingMore && places.length > 0 && <LinearProgress className={classes.more} />}
          <Grid container spacing={3} className={classes.list}>
            {places.map((place, i) => (
              <Grid ref={elRefs[i]} key={place.id} item xs={12}>
                <PlaceDetails selected={childClicked === i} refProp={elRefs[i]} place={place} loadDetails={loadDetails} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
};

export default List;
