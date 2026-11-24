import React from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { AppBar, Toolbar, Typography, InputBase, Box } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

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
        placeholder={mapsLoaded ? 'Search…' : 'Loading map…'}
        disabled={!mapsLoaded}
        inputProps={{ 'aria-label': 'Search a place' }}
        classes={{ root: classes.inputRoot, input: classes.inputInput }}
      />
    </div>
  );

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Typography variant="h5" className={classes.title}>
          Travel Advisor
        </Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" className={classes.title}>
            Explore new places
          </Typography>
          {/* Autocomplete needs google.maps.places, so render it only after the map script has loaded */}
          {mapsLoaded ? (
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} options={AUTOCOMPLETE_OPTIONS}>
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
