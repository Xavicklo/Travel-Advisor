import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { InputBase } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ExploreIcon from '@material-ui/icons/Explore';

import useStyles from './styles';

// Only ask Google for the fields we use: fewer fields = lower Places API cost.
const AUTOCOMPLETE_OPTIONS = { fields: ['geometry', 'name'] };

// `actions`: extra buttons shown on the brand row (e.g. collapse the panel)
// `glass`: see-through frosted background (phones, floating over the map)
// `compact`: brand row tucked away while the user pans the map; `onExpand` brings it back
const Header = ({
  onPlaceChanged, onLoad, mapsLoaded, actions = null, glass = false, compact = false, onExpand,
  centerText = '', centerHint = '',
}) => {
  const classes = useStyles();

  const searchBox = (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        // All-in-one: pick a suggested place to go there, or press Enter to search for it nearby
        placeholder={mapsLoaded ? '輸入地址設中心點，或搜尋美食住宿…' : '地圖載入中…'}
        disabled={!mapsLoaded}
        inputProps={{ 'aria-label': '搜尋美食、住宿、景點或地點' }}
        classes={{ root: classes.inputRoot, input: classes.inputInput }}
      />
    </div>
  );

  // Compact header that sits on top of the side panel, like the search box in Google Maps
  return (
    <header
      className={`${classes.bar} ${glass ? classes.glass : ''} ${compact ? classes.compact : ''}`}
      onClick={compact ? onExpand : undefined}
      onFocus={onExpand}
    >
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
        <span className={classes.byline}>
          <span className={classes.signature}>by Xavick</span>
          {actions}
        </span>
      </div>
      {/* Autocomplete needs google.maps.places, so render it only after the map script has loaded */}
      {mapsLoaded ? (
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} options={AUTOCOMPLETE_OPTIONS} className={classes.autocomplete}>
          {searchBox}
        </Autocomplete>
      ) : (
        searchBox
      )}
      {/* Where distances are measured from, so users know the box can move it */}
      {centerText && (
        <div className={classes.centerLine}>
          <span className={classes.centerPinDot}>📍</span>
          搜尋中心：<strong className={classes.centerName}>{centerText}</strong>
          {centerHint && <span className={classes.centerHint}>· {centerHint}</span>}
        </div>
      )}
    </header>
  );
};

export default Header;
