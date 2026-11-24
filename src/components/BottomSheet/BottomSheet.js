import React, { useRef, useState, useEffect } from 'react';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

/**
 * Draggable bottom sheet for phones, like Apple/Google Maps.
 * Three snap points: peek (just the handle and a summary), half, full.
 * Drag the handle; on release it snaps to the nearest point, or to the next one
 * in the direction of a quick flick.
 */
export const PEEK_PX = 84;
const HALF_RATIO = 0.5;
const FULL_RATIO = 0.88;
const FLICK_SPEED = 0.5; // px per ms; faster than this counts as a flick

export const snapHeight = (snap, viewport = window.innerHeight) => {
  if (snap === 'full') return viewport * FULL_RATIO;
  if (snap === 'half') return viewport * HALF_RATIO;
  return PEEK_PX;
};

const ORDER = ['peek', 'half', 'full'];

const useStyles = makeStyles((theme) => ({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '18px 18px 0 0',
    overflow: 'hidden',
  },
  animated: {
    transition: 'height 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.05)', // a little overshoot, like iOS
  },
  grabArea: {
    flexShrink: 0,
    padding: theme.spacing(1, 2, 1.25),
    cursor: 'grab',
    touchAction: 'none', // we handle the drag ourselves, so the browser shouldn't scroll
    userSelect: 'none',
    background: '#fff',
    borderBottom: '1px solid #eceff1',
    '&:active': { cursor: 'grabbing' },
  },
  bar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    background: '#c5ccd3',
    margin: '0 auto 8px',
  },
  summary: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    background: '#fff',
    overscrollBehavior: 'contain', // scrolling the list doesn't drag the page
  },
}));

const BottomSheet = ({ snap, onSnapChange, summary, children }) => {
  const classes = useStyles();
  const [dragHeight, setDragHeight] = useState(null); // height while the finger is down
  const drag = useRef(null);

  // Keep the height right when the phone rotates
  const [, forceRender] = useState(0);
  useEffect(() => {
    const onResize = () => forceRender((n) => n + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startHeight: snapHeight(snap), lastY: e.clientY, lastTime: performance.now(), velocity: 0, moved: false };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    d.velocity = (e.clientY - d.lastY) / Math.max(1, now - d.lastTime); // + is downwards
    d.lastY = e.clientY;
    d.lastTime = now;
    if (Math.abs(e.clientY - d.startY) > 4) d.moved = true;
    const height = d.startHeight - (e.clientY - d.startY);
    setDragHeight(Math.min(Math.max(height, PEEK_PX * 0.8), window.innerHeight * 0.95));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    setDragHeight(null);

    const index = ORDER.indexOf(snap);
    if (!d.moved) {
      // A tap on the handle: open from peek, otherwise close
      onSnapChange(snap === 'peek' ? 'half' : 'peek');
      return;
    }
    if (d.velocity < -FLICK_SPEED) {
      onSnapChange(ORDER[Math.min(index + 1, ORDER.length - 1)]); // flick up
      return;
    }
    if (d.velocity > FLICK_SPEED) {
      onSnapChange(ORDER[Math.max(index - 1, 0)]); // flick down
      return;
    }
    // Slow drag: snap to whichever point is closest to where the finger let go
    const current = d.startHeight - (d.lastY - d.startY);
    const nearest = ORDER.reduce((best, s) => (
      Math.abs(snapHeight(s) - current) < Math.abs(snapHeight(best) - current) ? s : best
    ), 'peek');
    onSnapChange(nearest);
  };

  const height = dragHeight ?? snapHeight(snap);

  return (
    <Paper elevation={10} className={`${classes.sheet} ${dragHeight == null ? classes.animated : ''}`} style={{ height }}>
      <div
        className={classes.grabArea}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="button"
        tabIndex={0}
        aria-label={snap === 'peek' ? '展開結果' : '收起結果'}
        onKeyDown={(e) => e.key === 'Enter' && onSnapChange(snap === 'peek' ? 'half' : 'peek')}
      >
        <div className={classes.bar} />
        <div className={classes.summary}>{summary}</div>
      </div>
      <div className={classes.body}>{children}</div>
    </Paper>
  );
};

export default BottomSheet;
