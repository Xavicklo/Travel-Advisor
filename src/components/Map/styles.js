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
    height: 28,
    padding: '0 8px 0 3px',
    borderRadius: 14,
    background: '#fff',
    border: '2px solid',
    color: theme.palette.text.primary,
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap',
  },
  dotRating: {
    lineHeight: 1,
  },
  kindIcon: {
    borderRadius: '50%',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  typography: {
    lineHeight: 1.3,
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

  // Fixed pin at the centre of the map: the tip of the pin marks the exact centre
  centerMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none', // never blocks dragging or clicking the map
    zIndex: 5,
  },
  centerPin: {
    fontSize: 44,
    color: '#d32f2f',
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.35))',
    marginBottom: -4, // the icon has empty space under the tip
  },
  centerLabel: {
    background: '#d32f2f',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    whiteSpace: 'nowrap',
  },

  // The user's location: blue dot with a pulsing ring
  userDot: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#1a73e8',
    border: '3px solid #fff',
    boxShadow: '0 0 4px rgba(0,0,0,0.4)',
    zIndex: 4,
  },
  userPulse: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: '50%',
    background: 'rgba(26, 115, 232, 0.35)',
    animation: '$pulse 2s ease-out infinite',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '100%': { transform: 'scale(3.5)', opacity: 0 },
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
