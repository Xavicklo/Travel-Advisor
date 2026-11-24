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
} from '@material-ui/core';
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
  childClicked,
  isLoading,
  error,
}) => {
  const [elRefs, setElRefs] = useState([]);
  const [draft, setDraft] = useState(keyword); // what's typed; applied on Enter or chip click
  const classes = useStyles();

  useEffect(() => {
    setElRefs((refs) => Array(places.length).fill().map((_, i) => refs[i] || createRef()));
  }, [places]);

  useEffect(() => setDraft(keyword), [keyword]);

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
            <Typography variant="body2" color="textSecondary" className={classes.message}>
              找到 {places.length} 個{keyword ? `「${keyword}」` : ''}結果
            </Typography>
          )}
          <Grid container spacing={3} className={classes.list}>
            {places.map((place, i) => (
              <Grid ref={elRefs[i]} key={place.id} item xs={12}>
                <PlaceDetails selected={childClicked === i} refProp={elRefs[i]} place={place} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
};

export default List;
