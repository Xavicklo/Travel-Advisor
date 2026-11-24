import { alpha, makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  // Google's Autocomplete dropdown is added to <body>, so it can only be styled globally.
  '@global': {
    '.pac-container': {
      borderRadius: 12,
      marginTop: 6,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      border: 'none',
      fontFamily: theme.typography.fontFamily,
    },
    '.pac-item': {
      padding: '8px 14px',
      fontSize: 15,
      lineHeight: '24px',
      cursor: 'pointer',
    },
    '.pac-item-query': { fontSize: 15 },
  },

  toolbar: {
    background: 'linear-gradient(to left, #000046, #1cb5e0)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 3),
    [theme.breakpoints.down('xs')]: { padding: theme.spacing(1.5, 2) },
  },
  brand: {
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  subtitle: {
    opacity: 0.85,
    [theme.breakpoints.down('xs')]: { display: 'none' },
  },
  searchWrap: {
    flex: '0 1 520px',
    [theme.breakpoints.down('sm')]: { flex: '1 1 100%' }, // full width on its own row on small screens
  },
  autocomplete: {
    width: '100%',
  },

  // The pill-shaped search bar
  search: {
    position: 'relative',
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    border: `1px solid ${alpha(theme.palette.common.white, 0.35)}`,
    color: theme.palette.common.white,
    transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow', 'transform', 'color'], {
      duration: theme.transitions.duration.short,
    }),

    // Hover feedback: brighter, lifted, with a soft glow
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.28),
      borderColor: alpha(theme.palette.common.white, 0.8),
      boxShadow: `0 6px 20px ${alpha('#000046', 0.35)}`,
      transform: 'translateY(-1px)',
    },
    '&:hover $searchIcon': {
      transform: 'scale(1.15)',
    },

    // Focus: turns white with dark text, like a real search field
    '&:focus-within': {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.common.white,
      color: theme.palette.text.primary,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.common.white, 0.35)}, 0 8px 24px ${alpha('#000046', 0.35)}`,
      transform: 'translateY(-1px)',
    },
    '&:focus-within $searchIcon': {
      color: theme.palette.primary.main,
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: theme.transitions.create(['transform', 'color'], { duration: theme.transitions.duration.short }),
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
    height: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 2, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    fontSize: 17,
    width: '100%',
    '&::placeholder': { opacity: 0.8 },
  },
}));
