// Renders <defs> with a distinct SVG pattern per anchor, tinted to its color.
function PatternShape({ type, color }) {
  switch (type) {
    case 'dots':
      return <circle cx="6" cy="6" r="2" fill={color} />;
    case 'lines':
      return <path d="M0 12 L12 0" stroke={color} strokeWidth="2" />;
    case 'waves':
      return <path d="M0 6 Q3 1 6 6 T12 6" stroke={color} strokeWidth="1.6" fill="none" />;
    case 'cross':
      return (
        <>
          <path d="M0 6 H12" stroke={color} strokeWidth="1.4" />
          <path d="M6 0 V12" stroke={color} strokeWidth="1.4" />
        </>
      );
    case 'rings':
      return <circle cx="6" cy="6" r="4" fill="none" stroke={color} strokeWidth="1.6" />;
    case 'grid':
      return (
        <>
          <path d="M0 0 H12 V12" stroke={color} strokeWidth="1.2" fill="none" />
        </>
      );
    default:
      return <circle cx="6" cy="6" r="2" fill={color} />;
  }
}

export default function Patterns({ anchors, idPrefix = 'pat', tile = 12 }) {
  return (
    <defs>
      {anchors.map((a) => (
        <pattern
          key={a.id}
          id={`${idPrefix}-${a.id}`}
          width={tile}
          height={tile}
          patternUnits="userSpaceOnUse"
        >
          <PatternShape type={a.pattern} color={a.color} />
        </pattern>
      ))}
    </defs>
  );
}
