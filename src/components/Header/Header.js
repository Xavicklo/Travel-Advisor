import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { InputBase } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ExploreIcon from '@material-ui/icons/Explore';

import useStyles from './styles';

// Only ask Google for the fields we use: fewer fields = lower Places API cost.
const AUTOCOMPLETE_OPTIONS = { fields: ['geometry', 'name'] };

// `actions`: extra buttons shown on the brand row (e.g. collapse the panel)
const Header = ({ onPlaceChanged, onLoad, mapsLoaded, actions = null }) => {
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

  // Compact header that sits on top of the side panel, like the search box in Google Maps
  return (
    <header className={classes.bar}>
      <div className={classes.brandRow}>
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
        {actions}
      </div>
      {/* Autocomplete needs google.maps.places, so render it only after the map script has loaded */}
      {mapsLoaded ? (
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} options={AUTOCOMPLETE_OPTIONS} className={classes.autocomplete}>
          {searchBox}
        </Autocomplete>
      ) : (
        searchBox
      )}
    </header>
  );
};

export default Header;
