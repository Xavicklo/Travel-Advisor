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
  locateButton: {
    margin: theme.spacing(0.5, 0, 1.5),
    borderRadius: 20,
    background: 'linear-gradient(to right, #1cb5e0, #000046)',
  },
  locateError: {
    marginBottom: theme.spacing(1),
  },
  sliders: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(3),
    // Stack them when the panel is too narrow for two sliders
    [theme.breakpoints.between('md', 'md')]: { gridTemplateColumns: '1fr' },
    '@media (max-width: 420px)': { gridTemplateColumns: '1fr' },
  },
  slider: {
    '& .MuiSlider-markLabel': { fontSize: 11 },
  },
  ratingSlider: {
    color: '#f5a623', // star colour
  },
  radiusLabel: {
    marginBottom: 4,
  },
  radiusHint: {
    color: theme.palette.text.secondary,
    fontSize: 12,
  },
  nearestBox: {
    margin: theme.spacing(0, 1, 2),
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    background: '#fff8e1',
    border: '1px solid #ffe082',
  },
  expandButton: {
    marginTop: theme.spacing(1),
    borderRadius: 16,
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
  recent: {
    marginTop: theme.spacing(1),
  },
  recentTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  recentChip: {
    maxWidth: '100%',
  },
  tabs: {
    margin: theme.spacing(0, 1, 1),
    borderBottom: '1px solid #e0e0e0',
  },
  favTab: {
    minHeight: 48,
    '& .MuiTab-wrapper': { flexDirection: 'row', gap: 6 },
    '& .MuiTab-labelIcon': { minHeight: 48 },
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
