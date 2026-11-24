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
  radiusBox: {
    margin: theme.spacing(1, 1, 1),
    padding: theme.spacing(1.5, 2, 0.5),
    borderRadius: 12,
    background: 'rgba(28, 181, 224, 0.08)',
  },
  radiusLabel: {
    marginBottom: 4,
  },
  radiusHint: {
    color: theme.palette.text.secondary,
    fontSize: 12,
  },
  resultBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: theme.spacing(1, 1, 1.5),
  },
  sort: {
    fontSize: 14,
    fontWeight: 600,
  },
  more: {
    margin: theme.spacing(0, 1, 1.5),
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
