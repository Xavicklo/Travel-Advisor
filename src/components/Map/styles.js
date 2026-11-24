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
    position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 1, '&:hover': { zIndex: 3 },
  },
  pointer: {
    cursor: 'pointer',
    width: '100%',
  },
  nearby: {
    marginTop: 4,
    fontSize: 11,
    color: theme.palette.primary.main,
    fontWeight: 600,
  },

  // Small marker for places that didn't get a card; shows the card on hover
  dotContainer: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    '&:hover': { zIndex: 4 },
    '&:hover $preview': { display: 'block' },
  },
  dot: {
    minWidth: 26,
    height: 26,
    padding: '0 4px',
    borderRadius: 13,
    background: '#fff',
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  preview: {
    display: 'none',
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
  },

  // Several overlapping dots merged into one bubble
  cluster: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: theme.palette.primary.main,
    color: '#fff',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: `0 0 0 6px ${theme.palette.primary.main}40`,
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
  labelToggle: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: '4px 12px 6px',
  },
  missingKey: {
    padding: theme.spacing(3),
    color: theme.palette.error.main,
  },
}));
