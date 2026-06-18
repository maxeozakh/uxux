// Renders a pixel-art sprite from a grid of single-char keys mapped to colors.
export default function PixelSprite({ grid, palette, pixel = 7, className, style, flip = false }) {
  const rows = grid.length;
  const cols = grid[0].length;
  const rects = [];
  for (let y = 0; y < rows; y++) {
    const row = grid[y];
    for (let x = 0; x < cols; x++) {
      const fill = palette[row[x]];
      if (!fill) continue;
      rects.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1.03} height={1.03} fill={fill} />,
      );
    }
  }
  return (
    <svg
      className={className}
      style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined }}
      width={cols * pixel}
      height={rows * pixel}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
    >
      {rects}
    </svg>
  );
}
