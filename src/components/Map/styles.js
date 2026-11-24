import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  paper: {
    padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100px',
  },
  mapContainer: {
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  locateFab: {
    position: 'absolute',
    right: 10,
    zIndex: 6,
    background: '#fff',
    transition: 'bottom 0.25s ease',
    '&:hover': { background: '#f5f5f5' },
  },
  // 圖層 picker
  layersPaper: {
    padding: theme.spacing(1.5),
    borderRadius: 14,
  },
  layersTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  layersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 64px)',
    gap: theme.spacing(1),
  },
  layerOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    padding: 3,
    border: '2px solid transparent',
  },
  layerActive: {
    borderColor: theme.palette.primary.main,
    '& $layerLabel': { color: theme.palette.primary.main, fontWeight: 700 },
  },
  layerSwatch: {
    position: 'relative',
    width: 54,
    height: 54,
    borderRadius: 8,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
  },
  layerBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    padding: '1px 5px',
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    background: '#e8710a',
  },
  layerLabel: {
    fontSize: 12,
  },
  markerContainer: {
    position: 'absolute', transform: 'translate(-50%, -50%)', zIndex: 1, '&:hover': { zIndex: 3 },
  },
  // Zoom-responsive label: icon on the place, rating and name to its right
  labelContainer: {
    position: 'absolute',
    transform: 'translate(-14px, -50%)', // keep the icon centred on the place
    zIndex: 3,
    '&:hover': { zIndex: 7 },
    '&:hover $preview': { display: 'block' },
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px 2px 2px',
    borderRadius: 16,
    background: '#fff',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
    fontSize: 12,
    lineHeight: 1,
    transition: 'transform 0.15s ease',
    '&:hover': { transform: 'scale(1.06)' },
  },
  labelSelected: {
    padding: '3px 10px 3px 3px',
    fontSize: 13,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}, 0 3px 10px rgba(0,0,0,0.35)`,
  },
  labelRating: {
    color: '#e37400', // Google Maps' rating orange
    fontWeight: 700,
  },
  labelName: {
    fontWeight: 600,
    color: theme.palette.text.primary,
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
    padding: 2,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
    transition: 'transform 0.15s ease',
    '&:hover': { transform: 'scale(1.25)' },
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
  chainText: {
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: -0.5,
    fontFamily: '"Roboto", "Noto Sans TC", sans-serif',
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

  // Several overlapping places: a white pill with their icons stacked, plus "+N"
  clusterContainer: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    '&:hover': { zIndex: 5 },
    '&:hover $clusterTip': { display: 'block' },
    '&:hover $cluster': { transform: 'scale(1.1)' },
  },
  cluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px 2px 3px',
    borderRadius: 16,
    background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
    cursor: 'zoom-in',
    whiteSpace: 'nowrap',
    transition: 'transform 0.15s ease',
  },
  stack: {
    display: 'flex',
  },
  stackItem: {
    display: 'flex',
    marginLeft: -8, // overlap the icons like a stack of cards
    border: '2px solid #fff',
    borderRadius: '50%',
    '&:first-child': { marginLeft: 0 },
  },
  clusterCount: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  clusterTip: {
    display: 'none',
    position: 'absolute',
    bottom: 34,
    left: '50%',
    transform: 'translateX(-50%)',
    minWidth: 200,
    maxWidth: 260,
    padding: '8px 10px',
    borderRadius: 10,
    background: '#fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    fontSize: 13,
  },
  clusterTipTitle: {
    fontWeight: 700,
    marginBottom: 6,
  },
  clusterTipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 0',
  },
  clusterTipName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  clusterTipRating: {
    color: '#f57c00',
    fontWeight: 600,
  },
  clusterTipMore: {
    color: theme.palette.text.secondary,
    paddingTop: 2,
  },
  clusterTipHint: {
    marginTop: 6,
    paddingTop: 6,
    borderTop: '1px solid #eee',
    color: theme.palette.primary.main,
    fontWeight: 600,
  },

  // Pin at the search centre: the tip of the pin marks the exact point
  centerMarker: {
    position: 'absolute',
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

  searchHere: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    zIndex: 6,
    borderRadius: 20,
    padding: '6px 18px',
    fontWeight: 700,
    background: 'linear-gradient(to right, #1cb5e0, #000046)',
    boxShadow: '0 4px 14px rgba(0,0,70,0.35)',
    animation: '$dropIn 0.25s ease-out',
  },
  '@keyframes dropIn': {
    '0%': { opacity: 0, transform: 'translate(-50%, -8px)' },
    '100%': { opacity: 1, transform: 'translate(-50%, 0)' },
  },
  weather: {
    position: 'absolute',
    top: 16,
    right: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    lineHeight: 1.2,
  },
  weatherIcon: {
    fontSize: 28,
  },
  // A slim vertical strip on the right edge (under the weather on desktop)
  labelToggle: {
    position: 'absolute',
    top: 96,
    right: 16,
    padding: 4,
    borderRadius: 10,
  },
  cardPhoto: {
    width: '100%',
    cursor: 'pointer',
  },
  // Phones: a slim vertical strip on the right edge, out of the way of the map
  labelToggleMobile: {
    top: 140,
    right: 6,
    padding: 3,
    '& $modeButton': { padding: '6px 4px', fontSize: 11, writingMode: 'vertical-rl', letterSpacing: 2 },
  },
  modeButton: {
    padding: '4px 10px',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  modeStats: {
    marginTop: 4,
    textAlign: 'center',
  },
  missingKey: {
    padding: theme.spacing(3),
    color: theme.palette.error.main,
  },
}));
