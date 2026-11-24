import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  root: {
    background: '#fff',
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    display: 'block',
    width: '100%',
    height: 180,
    objectFit: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
    '&:hover': { background: '#fff' },
  },
  content: {
    padding: theme.spacing(1.5, 2, 2),
  },
  name: {
    fontWeight: 700,
    lineHeight: 1.3,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingValue: {
    fontWeight: 700,
    fontSize: 15,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    fontSize: 14,
  },
  kind: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontWeight: 600,
  },
  muted: {
    color: theme.palette.text.secondary,
    fontSize: 14,
  },

  // Row of round action buttons with labels
  actions: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: theme.spacing(2),
  },
  action: {
    flex: 1,
    flexDirection: 'column',
    gap: 6,
    padding: theme.spacing(0.5, 0),
    borderRadius: 12,
    '&.Mui-disabled': { opacity: 0.35 },
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a73e8',
    border: '1px solid #dadce0',
    transition: 'background 0.15s ease',
    '$action:hover &': { background: '#f1f5fd' },
  },
  actionPrimary: {
    color: '#fff',
    background: '#1a73e8', // Google Maps directions blue
    border: 'none',
    '$action:hover &': { background: '#1765cc' },
  },
  actionLabel: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: 500,
  },

  infoRow: {
    width: '100%',
    justifyContent: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    fontSize: 14,
    textAlign: 'left',
    color: theme.palette.text.primary,
    '&:hover': { background: '#f7f9fb' },
  },
  infoIcon: {
    color: '#1a73e8',
    flexShrink: 0,
  },

  reviews: {
    padding: theme.spacing(1.5, 2, 3),
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(2, 0),
  },
  review: {
    padding: theme.spacing(1.5, 0),
    borderBottom: '1px solid #eceff1',
  },
  reviewHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  reviewMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 32,
    height: 32,
  },
  reviewText: {
    marginTop: 6,
    whiteSpace: 'pre-line',
    // Long reviews: show 5 lines
    display: '-webkit-box',
    WebkitLineClamp: 5,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  allReviews: {
    marginTop: theme.spacing(2),
    borderRadius: 20,
  },
}));
