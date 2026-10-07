/* js/hero-artwork.js
   Ilustrasi latar hero (langit, gunung, danau, sawah berundak, rumah)
   dibuat prosedural dengan SVG + fungsi gelombang sinus, bukan foto. */

function wavePath(baseY, amplitude, frequency, phase, width, step, floor) {
  let d = `M0 ${baseY}`;
  for (let x = 0; x <= width; x += step) {
    const y = baseY + Math.sin((x / width) * Math.PI * frequency + phase) * amplitude;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  d += ` L${width} ${floor} L0 ${floor} Z`;
  return d;
}
function waveLine(y, amplitude, frequency, phase, width, step) {
  const pts = [];
  for (let x = 0; x <= width; x += step) {
    const yy = y + Math.sin((x / width) * Math.PI * frequency + phase) * amplitude;
    pts.push(`${x},${yy.toFixed(1)}`);
  }
  return pts.join(" ");
}

const HOUSES = [
  { x: 90, s: 1 }, { x: 210, s: 0.8 }, { x: 330, s: 1.05 },
  { x: 1010, s: 0.9 }, { x: 1140, s: 1.1 }, { x: 1270, s: 0.85 },
];
const TERRACE_COLORS = ["#5E8A80", "#4F7A72", "#41665F", "#33524D"];

const HeroArtwork = () => (
  <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F1F6FA" />
        <stop offset="45%" stopColor="#CFE0EE" />
        <stop offset="78%" stopColor="#A9C4DA" />
        <stop offset="100%" stopColor="#7F9DB8" />
      </linearGradient>
      <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B4CCDF" />
        <stop offset="100%" stopColor="#7E9EBB" />
      </linearGradient>
      <linearGradient id="dimGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0F1E2A" stopOpacity="0" />
        <stop offset="100%" stopColor="#0F1E2A" stopOpacity="0.45" />
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="1440" height="800" fill="url(#skyGrad)" />
    <circle cx="1180" cy="160" r="130" fill="url(#sunGrad)" />
    <circle cx="1180" cy="160" r="46" fill="#F7FAFC" />

    <polygon fill="#93AABF" opacity="0.55" points="0,430 150,380 300,410 480,350 650,400 820,360 1000,410 1200,370 1440,420 1440,800 0,800" />
    <path fill="#5F7A93" opacity="0.9" d="M0,440 L620,440 L700,300 L780,440 L1440,440 L1440,800 L0,800 Z" />

    <rect x="0" y="440" width="1440" height="85" fill="url(#lakeGrad)" />
    <polyline points={waveLine(462, 3, 8, 0, 1440, 40)} fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2" />
    <polyline points={waveLine(482, 3, 6, 1.4, 1440, 40)} fill="none" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2" />
    <polyline points={waveLine(502, 2.5, 7, 2.6, 1440, 40)} fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" />

    {HOUSES.map((h, i) => (
      <g key={i} transform={`translate(${h.x} 495) scale(${h.s})`}>
        <polygon points="-22,0 0,-24 22,0" fill="#3F5670" />
        <rect x="-18" y="0" width="36" height="24" fill="#E8EFF5" />
        <rect x="-4" y="8" width="8" height="16" fill="#3F5670" />
      </g>
    ))}

    {TERRACE_COLORS.map((c, i) => (
      <path key={i} fill={c} opacity={0.97}
        d={wavePath(560 + i * 62, 9 - i, 3 + i, i * 1.1, 1440, 40, 800)} />
    ))}

    <rect x="0" y="0" width="1440" height="800" fill="url(#dimGrad)" />
  </svg>
);
