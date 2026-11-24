import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { AppBar, Toolbar, Typography, InputBase, Box } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ExploreIcon from '@material-ui/icons/Explore';

import useStyles from './styles';

// Only ask Google for the fields we use: fewer fields = lower Places API cost.
const AUTOCOMPLETE_OPTIONS = { fields: ['geometry', 'name'] };

const Header = ({ onPlaceChanged, onLoad, mapsLoaded }) => {
  const classes = useStyles();

  const searchBox = (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        placeholder={mapsLoaded ? '搜尋城市、景點或地址…' : '地圖載入中…'}
        disabled={!mapsLoaded}
        inputProps={{ 'aria-label': '搜尋地點' }}
        classes={{ root: classes.inputRoot, input: classes.inputInput }}
      />
    </div>
  );

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Box>
          {/* Wordmark: compass badge + two-weight "Travel Advisor" */}
          <a href="/" className={classes.brand} aria-label="Travel Advisor 首頁">
            <span className={classes.badge}>
              <ExploreIcon className={classes.compass} />
            </span>
            <span className={classes.wordmark}>
              <span className={classes.wordBold}>Travel</span>
              <span className={classes.wordLight}>Advisor</span>
            </span>
          </a>
          <Typography variant="body2" className={classes.subtitle}>
            探索附近的餐廳、住宿與景點
          </Typography>
        </Box>
        <Box className={classes.searchWrap}>
          {/* Autocomplete needs google.maps.places, so render it only after the map script has loaded */}
          {mapsLoaded ? (
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} options={AUTOCOMPLETE_OPTIONS} className={classes.autocomplete}>
              {searchBox}
            </Autocomplete>
          ) : (
            searchBox
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
