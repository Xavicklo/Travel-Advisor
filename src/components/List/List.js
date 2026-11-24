import React, { useState, useEffect, createRef } from "react";
import {
  CircularProgress,
  Grid,
  Typography,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from "@material-ui/core";

import PlaceDetails from "../PlaceDetails/PlaceDetails";
import useStyles from "./styles.js";

const List = ({
  places,
  type,
  setType,
  rating,
  setRating,
  childClicked,
  isLoading,
  error,
}) => {
  const [elRefs, setElRefs] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    setElRefs((refs) =>
      Array(places.length)
        .fill()
        .map((_, i) => refs[i] || createRef())
    );
  }, [places]);

  return (
    <div className={classes.container}>
      <Typography variant="h6">探索附近好去處</Typography>
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress size="5rem" />
        </div>
      ) : (
        <>
          <FormControl className={classes.formControl}>
            <InputLabel id="type">類別</InputLabel>
            <Select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="restaurants">餐廳</MenuItem>
              <MenuItem value="hotels">住宿</MenuItem>
              <MenuItem value="attractions">景點</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="rating">評分</InputLabel>
            <Select
              id="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="2">2 星以上</MenuItem>
              <MenuItem value="3">3 星以上</MenuItem>
              <MenuItem value="4">4 星以上</MenuItem>
              <MenuItem value="4.5">4.5 星以上</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" className={classes.message}>
              {error}
            </Typography>
          )}
          {!error && places.length === 0 && (
            <Typography color="textSecondary" className={classes.message}>
              這個範圍內沒有找到地點，試著移動地圖或調整篩選條件。
            </Typography>
          )}
          <Grid container spacing={3} className={classes.list}>
            {places?.map((place, i) => (
              <Grid ref={elRefs[i]} key={place.id} item xs={12}>
                <PlaceDetails
                  selected={childClicked === i}
                  refProp={elRefs[i]}
                  place={place}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
};

export default List;
