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
    padding: theme.spacing(1, 2, 0),
    borderRadius: 12,
    background: 'rgba(28, 181, 224, 0.08)',
  },
  sliderLabel: {
    fontSize: 13,
  },
  slider: {
    '& .MuiSlider-markLabel': { fontSize: 11 },
  },
  ratingSlider: {
    color: '#f5a623', // star colour
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
