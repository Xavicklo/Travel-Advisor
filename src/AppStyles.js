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
  collapseButton: {
    color: '#fff',
  },
}));
