import { useEffect, useRef, useCallback } from 'react';

// Unified pointer drag for mouse + touch. Calls onMove with svg-space coords.
// `getPoint` maps a clientX/clientY to the coordinate space you want.
export function usePointerDrag(getPoint, onMove, onStart, onEnd) {
  const draggingRef = useRef(false);

  const handleDown = useCallback(
    (e) => {
      draggingRef.current = true;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      onStart?.();
      onMove(getPoint(e.clientX, e.clientY));
    },
    [getPoint, onMove, onStart],
  );

  const handleMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      onMove(getPoint(e.clientX, e.clientY));
    },
    [getPoint, onMove],
  );

  const handleUp = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      onEnd?.();
    },
    [onEnd],
  );

  return {
    onPointerDown: handleDown,
    onPointerMove: handleMove,
    onPointerUp: handleUp,
    onPointerCancel: handleUp,
  };
}

// Map a client coordinate into the coordinate space of an SVG via its viewBox.
export function useSvgPoint(svgRef) {
  return useCallback(
    (clientX, clientY) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const x = ((clientX - rect.left) / rect.width) * vb.width + vb.x;
      const y = ((clientY - rect.top) / rect.height) * vb.height + vb.y;
      return { x, y };
    },
    [svgRef],
  );
}

// Block page scroll/zoom while interacting with a touch widget.
export function useLockTouchScroll(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, [ref]);
}
