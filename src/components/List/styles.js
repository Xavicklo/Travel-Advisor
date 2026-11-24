import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  filters: {
    padding: theme.spacing(2, 2, 1),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  typeRow: {
    display: 'flex',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    fontWeight: 600,
  },
  keywordInput: {
    borderRadius: 20,
    background: '#f5f7f9',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  recent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  recentTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  recentChip: {
    maxWidth: '100%',
  },

  // Distance + rating sliders, one above the other
  sliders: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1.5, 3, 0.5),
    borderRadius: 16,
    background: '#e4e9f0', // soft grey so the raised knobs and sunken tracks read as 3D
  },
  sliderLabel: {
    fontSize: 13,
    marginLeft: -8,
  },
  // Soft 3D (neumorphic) slider: a sunken pill track and a big raised round knob
  slider: {
    height: 22,
    padding: '16px 0 28px',
    color: '#5b7392', // filled part: slate blue
    '& .MuiSlider-rail': {
      height: 22,
      borderRadius: 11,
      opacity: 1,
      background: '#dde3ea',
      boxShadow: 'inset 3px 3px 6px rgba(150, 165, 190, 0.6), inset -3px -3px 6px rgba(255, 255, 255, 0.9)',
    },
    '& .MuiSlider-track': {
      height: 22,
      borderRadius: 11,
      background: 'linear-gradient(90deg, #7c90aa, #556c8b)',
      boxShadow: 'inset 2px 2px 5px rgba(30, 45, 70, 0.45)',
    },
    '& .MuiSlider-thumb': {
      width: 40,
      height: 40,
      marginTop: -9, // (22 - 40) / 2: centred on the track
      marginLeft: -20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #f6f8fb, #dfe5ec)',
      boxShadow: '4px 4px 10px rgba(110, 125, 150, 0.55), -3px -3px 8px rgba(255, 255, 255, 0.95)',
      transition: 'box-shadow 0.15s ease, transform 0.15s ease',
      '&:hover, &.Mui-focusVisible': {
        boxShadow: '4px 4px 10px rgba(110, 125, 150, 0.55), -3px -3px 8px rgba(255, 255, 255, 0.95), 0 0 0 6px rgba(91, 115, 146, 0.18)',
      },
      '&.MuiSlider-active': {
        transform: 'scale(1.08)',
        boxShadow: '2px 2px 6px rgba(110, 125, 150, 0.6), -2px -2px 5px rgba(255, 255, 255, 0.95), 0 0 0 8px rgba(91, 115, 146, 0.2)',
      },
    },
    '& .MuiSlider-valueLabel': {
      left: 4, // centre the bubble over the 40px knob
      top: -36,
    },
    '& .MuiSlider-mark': { display: 'none' }, // tick dots look odd inside the sunken track
    '& .MuiSlider-markLabel': { fontSize: 11, top: 46, color: theme.palette.text.secondary },
  },
  ratingSlider: {
    color: '#f5a623', // value bubble in star colour
    '& .MuiSlider-track': {
      background: 'linear-gradient(90deg, #f7c46c, #f0a020)',
      boxShadow: 'inset 2px 2px 5px rgba(140, 80, 0, 0.35)',
    },
    '& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible': {
      boxShadow: '4px 4px 10px rgba(110, 125, 150, 0.55), -3px -3px 8px rgba(255, 255, 255, 0.95), 0 0 0 6px rgba(245, 166, 35, 0.22)',
    },
  },

  tabs: {
    borderBottom: '1px solid #e0e0e0',
    minHeight: 44,
  },
  tab: {
    minHeight: 44,
  },
  favTab: {
    '& .MuiTab-wrapper': { flexDirection: 'row', gap: 6 },
  },

  resultBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    borderBottom: '1px solid #eceff1',
  },
  sort: {
    fontSize: 14,
    fontWeight: 600,
  },
  loading: {
    padding: theme.spacing(6, 0),
    display: 'flex',
    justifyContent: 'center',
  },
  message: {
    padding: theme.spacing(2),
  },
  nearestBox: {
    margin: theme.spacing(0, 2, 2),
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    background: '#fff8e1',
    border: '1px solid #ffe082',
  },
  expandButton: {
    marginTop: theme.spacing(1),
    borderRadius: 16,
  },
  loadMore: {
    padding: theme.spacing(2),
  },

  // Details view
  detailBar: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    background: '#fff',
    padding: theme.spacing(0.5, 1),
    borderBottom: '1px solid #eceff1',
  },
}));
