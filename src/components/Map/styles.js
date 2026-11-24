import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  paper: {
    padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100px',
  },
  mapContainer: {
    position: 'relative',
    height: '85vh',
    width: '100%',
    [theme.breakpoints.down('sm')]: { height: '60vh' },
  },
  markerContainer: {
    position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 1, '&:hover': { zIndex: 2 },
  },
  pointer: {
    cursor: 'pointer',
    width: '100%',
  },
  weather: {
    position: 'absolute',
    top: 12,
    left: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    lineHeight: 1.2,
  },
  weatherIcon: {
    fontSize: 28,
  },
  missingKey: {
    padding: theme.spacing(3),
    color: theme.palette.error.main,
  },
}));
