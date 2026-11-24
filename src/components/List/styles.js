import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    marginBottom: "30px",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  loading: {
    height: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    // background: "#33373E",
    padding: "25px",
  },
  marginBottom: {
    marginBottom: "30px",
  },
  list: {
    height: "75vh",
    overflow: "auto",
    [theme.breakpoints.down("sm")]: { height: "auto", maxHeight: "60vh" },
  },
  keywordBox: {
    margin: theme.spacing(0, 1, 2),
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing(1),
  },
  message: {
    margin: theme.spacing(1, 1, 2),
  },
}));
