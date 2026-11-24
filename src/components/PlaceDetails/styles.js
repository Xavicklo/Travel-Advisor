import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  card: {
    position: 'relative',
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(255,255,255,0.92)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
    transition: 'transform 0.15s ease',
    '&:hover': { background: '#fff', transform: 'scale(1.12)' },
  },
  reviewsBox: {
    background: '#f7f9fb',
    borderTop: '1px solid #e6eaef',
  },
  review: {
    padding: theme.spacing(1.5, 0),
    borderBottom: '1px solid #e6eaef',
    '&:last-of-type': { marginBottom: theme.spacing(1.5) },
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
  avatar: {
    width: 32,
    height: 32,
  },
  contact: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 14,
  },
  chip: {
    margin: '5px 5px 5px 0',
  },
  subtitle: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px',
  },
  selected: {
    outline: '3px solid #1cb5e0',
  },
  spacing: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
}));
