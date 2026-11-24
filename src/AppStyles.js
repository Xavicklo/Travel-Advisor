import { makeStyles } from '@material-ui/core/styles';

export const PANEL_WIDTH = 400;
export const PANEL_GAP = 16;

/** Google Maps-style layout: a full-screen map with a floating panel on top of it. */
export default makeStyles((theme) => ({
  root: {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden', // the page itself never scrolls; only the panel does
  },
  map: {
    position: 'absolute',
    inset: 0,
  },

  // Desktop: floating card on the left, full height
  panel: {
    position: 'absolute',
    top: PANEL_GAP,
    left: PANEL_GAP,
    bottom: PANEL_GAP,
    width: PANEL_WIDTH,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    overflow: 'hidden',
    transition: 'bottom 0.25s ease',
  },
  panelCollapsed: {
    bottom: 'auto', // only the header (logo + search box) stays visible
  },
  panelBody: {
    flex: 1,
    overflowY: 'auto',
    background: '#fff',
  },

  // Phones and small tablets: header on top, results in a bottom sheet
  mobileHeader: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    height: '50vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px 16px 0 0',
    overflow: 'hidden',
    transition: 'height 0.25s ease',
  },
  sheetCollapsed: {
    height: 56,
  },
  handle: {
    flexShrink: 0,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    fontSize: 12,
    color: theme.palette.text.secondary,
    borderBottom: '1px solid #eceff1',
    background: '#fff',
    '&::before': {
      content: '""',
      width: 36,
      height: 4,
      borderRadius: 2,
      background: '#cfd8dc',
    },
  },
  collapseButton: {
    color: '#fff',
  },
}));
