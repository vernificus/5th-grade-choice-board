import React from 'react';

// ── Skin color palettes mapped to existing avatar.color IDs ──
const SKIN_COLORS = {
  default: { base: '#63B3ED', dark: '#3182CE', light: '#BEE3F8', outline: '#2B6CB0' },
  green:   { base: '#68D391', dark: '#38A169', light: '#C6F6D5', outline: '#276749' },
  purple:  { base: '#B794F4', dark: '#805AD5', light: '#E9D8FD', outline: '#553C9A' },
  red:     { base: '#FC8181', dark: '#E53E3E', light: '#FED7D7', outline: '#C53030' },
  yellow:  { base: '#F6E05E', dark: '#D69E2E', light: '#FEFCBF', outline: '#B7791F' },
  pink:    { base: '#F687B3', dark: '#D53F8C', light: '#FED7E2', outline: '#97266D' },
  rainbow: { base: '#63B3ED', dark: '#805AD5', light: '#FED7E2', outline: '#553C9A', gradient: true },
};

function getEvolution(level) {
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
}

function getAuraColor(level) {
  if (level >= 7) return '#F687B3';
  if (level >= 6) return '#ED8936';
  if (level >= 5) return '#ECC94B';
  if (level >= 4) return '#B794F4';
  if (level >= 3) return '#63B3ED';
  return 'transparent';
}

// ── Eyes ──
function Eyes({ expression, cx, cy, s = 1 }) {
  switch (expression) {
    case 'cool':
      return (
        <g>
          <rect x={cx - 22 * s} y={cy - 7 * s} width={18 * s} height={11 * s} rx={3 * s} fill="#1A202C" />
          <rect x={cx + 4 * s} y={cy - 7 * s} width={18 * s} height={11 * s} rx={3 * s} fill="#1A202C" />
          <line x1={cx - 4 * s} y1={cy - 1 * s} x2={cx + 4 * s} y2={cy - 1 * s} stroke="#1A202C" strokeWidth={2 * s} />
          <rect x={cx - 20 * s} y={cy - 5 * s} width={5 * s} height={3 * s} rx={1 * s} fill="#4299E1" opacity="0.5" />
          <rect x={cx + 6 * s} y={cy - 5 * s} width={5 * s} height={3 * s} rx={1 * s} fill="#4299E1" opacity="0.5" />
        </g>
      );
    case 'excited':
      return (
        <g>
          <polygon points={`${cx - 14 * s},${cy - 8 * s} ${cx - 18 * s},${cy + 5 * s} ${cx - 7 * s},${cy - 2 * s} ${cx - 21 * s},${cy - 2 * s} ${cx - 10 * s},${cy + 5 * s}`} fill="#ECC94B" />
          <polygon points={`${cx + 14 * s},${cy - 8 * s} ${cx + 18 * s},${cy + 5 * s} ${cx + 7 * s},${cy - 2 * s} ${cx + 21 * s},${cy - 2 * s} ${cx + 10 * s},${cy + 5 * s}`} fill="#ECC94B" />
        </g>
      );
    case 'determined':
      return (
        <g>
          <ellipse cx={cx - 14 * s} cy={cy} rx={5 * s} ry={5 * s} fill="#1A202C" />
          <ellipse cx={cx + 14 * s} cy={cy} rx={5 * s} ry={5 * s} fill="#1A202C" />
          <circle cx={cx - 12 * s} cy={cy - 2 * s} r={1.5 * s} fill="white" />
          <circle cx={cx + 16 * s} cy={cy - 2 * s} r={1.5 * s} fill="white" />
          <line x1={cx - 21 * s} y1={cy - 8 * s} x2={cx - 7 * s} y2={cy - 11 * s} stroke="#1A202C" strokeWidth={3 * s} strokeLinecap="round" />
          <line x1={cx + 21 * s} y1={cy - 8 * s} x2={cx + 7 * s} y2={cy - 11 * s} stroke="#1A202C" strokeWidth={3 * s} strokeLinecap="round" />
        </g>
      );
    case 'smart':
      return (
        <g>
          <circle cx={cx - 14 * s} cy={cy} r={5 * s} fill="#1A202C" />
          <circle cx={cx + 14 * s} cy={cy} r={5 * s} fill="#1A202C" />
          <circle cx={cx - 12 * s} cy={cy - 2 * s} r={1.5 * s} fill="white" />
          <circle cx={cx + 16 * s} cy={cy - 2 * s} r={1.5 * s} fill="white" />
          <circle cx={cx + 14 * s} cy={cy} r={10 * s} fill="none" stroke="#D69E2E" strokeWidth={2 * s} />
          <line x1={cx + 14 * s} y1={cy + 10 * s} x2={cx + 10 * s} y2={cy + 22 * s} stroke="#D69E2E" strokeWidth={1.5 * s} />
        </g>
      );
    case 'ninja':
      return (
        <g>
          <line x1={cx - 20 * s} y1={cy} x2={cx - 6 * s} y2={cy - 3 * s} stroke="#1A202C" strokeWidth={3.5 * s} strokeLinecap="round" />
          <line x1={cx + 6 * s} y1={cy - 3 * s} x2={cx + 20 * s} y2={cy} stroke="#1A202C" strokeWidth={3.5 * s} strokeLinecap="round" />
        </g>
      );
    default: // happy
      return (
        <g>
          <circle cx={cx - 14 * s} cy={cy} r={5 * s} fill="#1A202C" />
          <circle cx={cx + 14 * s} cy={cy} r={5 * s} fill="#1A202C" />
          <circle cx={cx - 12 * s} cy={cy - 2 * s} r={2 * s} fill="white" />
          <circle cx={cx + 16 * s} cy={cy - 2 * s} r={2 * s} fill="white" />
        </g>
      );
  }
}

// ── Mouth ──
function Mouth({ expression, cx, cy, s = 1 }) {
  switch (expression) {
    case 'cool':
      return <line x1={cx - 8 * s} y1={cy} x2={cx + 8 * s} y2={cy - 2 * s} stroke="#1A202C" strokeWidth={2.5 * s} strokeLinecap="round" />;
    case 'excited':
      return (
        <g>
          <ellipse cx={cx} cy={cy + 2 * s} rx={10 * s} ry={8 * s} fill="#1A202C" />
          <ellipse cx={cx} cy={cy - 2 * s} rx={8 * s} ry={3 * s} fill="#FC8181" />
        </g>
      );
    case 'determined':
      return <line x1={cx - 10 * s} y1={cy} x2={cx + 10 * s} y2={cy} stroke="#1A202C" strokeWidth={3 * s} strokeLinecap="round" />;
    case 'smart':
      return <path d={`M${cx - 6 * s} ${cy} Q${cx} ${cy + 7 * s} ${cx + 6 * s} ${cy}`} fill="none" stroke="#1A202C" strokeWidth={2 * s} strokeLinecap="round" />;
    case 'ninja':
      return (
        <rect x={cx - 25 * s} y={cy - 5 * s} width={50 * s} height={12 * s} rx={4 * s} fill="#4A5568" opacity="0.9" />
      );
    default: // happy
      return <path d={`M${cx - 10 * s} ${cy} Q${cx} ${cy + 13 * s} ${cx + 10 * s} ${cy}`} fill="none" stroke="#1A202C" strokeWidth={2.5 * s} strokeLinecap="round" />;
  }
}

// ── Hats ──
function Hat({ type, cx, baseY, s = 1 }) {
  switch (type) {
    case 'cap':
      return (
        <g>
          <ellipse cx={cx} cy={baseY + 2 * s} rx={36 * s} ry={14 * s} fill="#E53E3E" stroke="#C53030" strokeWidth={1.5 * s} />
          <path d={`M${cx - 30 * s} ${baseY + 2 * s} Q${cx - 30 * s} ${baseY - 22 * s} ${cx} ${baseY - 24 * s} Q${cx + 30 * s} ${baseY - 22 * s} ${cx + 30 * s} ${baseY + 2 * s}`} fill="#E53E3E" stroke="#C53030" strokeWidth={1.5 * s} />
          <ellipse cx={cx + 28 * s} cy={baseY + 4 * s} rx={16 * s} ry={5 * s} fill="#C53030" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <rect x={cx - 26 * s} y={baseY - 2 * s} width={52 * s} height={16 * s} rx={3 * s} fill="#D69E2E" stroke="#B7791F" strokeWidth={1 * s} />
          <polygon
            points={`${cx - 26 * s},${baseY - 2 * s} ${cx - 18 * s},${baseY - 22 * s} ${cx - 10 * s},${baseY - 8 * s} ${cx},${baseY - 26 * s} ${cx + 10 * s},${baseY - 8 * s} ${cx + 18 * s},${baseY - 22 * s} ${cx + 26 * s},${baseY - 2 * s}`}
            fill="#ECC94B" stroke="#D69E2E" strokeWidth={1.5 * s}
          />
          <circle cx={cx} cy={baseY + 5 * s} r={3 * s} fill="#E53E3E" />
          <circle cx={cx - 13 * s} cy={baseY + 5 * s} r={2 * s} fill="#63B3ED" />
          <circle cx={cx + 13 * s} cy={baseY + 5 * s} r={2 * s} fill="#63B3ED" />
        </g>
      );
    case 'wizard':
      return (
        <g>
          <ellipse cx={cx} cy={baseY + 5 * s} rx={38 * s} ry={10 * s} fill="#553C9A" stroke="#44337A" strokeWidth={1.5 * s} />
          <polygon points={`${cx},${baseY - 50 * s} ${cx - 30 * s},${baseY + 5 * s} ${cx + 30 * s},${baseY + 5 * s}`} fill="#6B46C1" stroke="#553C9A" strokeWidth={1.5 * s} />
          <circle cx={cx} cy={baseY - 46 * s} r={4 * s} fill="#ECC94B" />
          <circle cx={cx - 8 * s} cy={baseY - 20 * s} r={2.5 * s} fill="#ECC94B" opacity="0.7" />
          <circle cx={cx + 12 * s} cy={baseY - 10 * s} r={2 * s} fill="#ECC94B" opacity="0.5" />
        </g>
      );
    case 'party':
      return (
        <g>
          <polygon points={`${cx},${baseY - 40 * s} ${cx - 20 * s},${baseY + 5 * s} ${cx + 20 * s},${baseY + 5 * s}`} fill="#ED64A6" stroke="#D53F8C" strokeWidth={1.5 * s} />
          <line x1={cx - 10 * s} y1={baseY - 15 * s} x2={cx + 10 * s} y2={baseY - 15 * s} stroke="#ECC94B" strokeWidth={2 * s} />
          <line x1={cx - 6 * s} y1={baseY - 28 * s} x2={cx + 6 * s} y2={baseY - 28 * s} stroke="#63B3ED" strokeWidth={2 * s} />
          <circle cx={cx} cy={baseY - 42 * s} r={4 * s} fill="#ECC94B" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d={`M${cx - 35 * s} ${baseY + 16 * s} Q${cx - 38 * s} ${baseY - 20 * s} ${cx} ${baseY - 22 * s} Q${cx + 38 * s} ${baseY - 20 * s} ${cx + 35 * s} ${baseY + 16 * s}`}
            fill="none" stroke="#2D3748" strokeWidth={5 * s} strokeLinecap="round" />
          <rect x={cx - 42 * s} y={baseY + 4 * s} width={16 * s} height={22 * s} rx={6 * s} fill="#4A5568" stroke="#2D3748" strokeWidth={1.5 * s} />
          <rect x={cx + 26 * s} y={baseY + 4 * s} width={16 * s} height={22 * s} rx={6 * s} fill="#4A5568" stroke="#2D3748" strokeWidth={1.5 * s} />
          <rect x={cx - 38 * s} y={baseY + 8 * s} width={8 * s} height={14 * s} rx={3 * s} fill="#68D391" />
          <rect x={cx + 30 * s} y={baseY + 8 * s} width={8 * s} height={14 * s} rx={3 * s} fill="#68D391" />
        </g>
      );
    default:
      return null;
  }
}

// ── Outfit overlays on body ──
function Outfit({ type, skin }) {
  switch (type) {
    case 'star':
      return (
        <g>
          <polygon points="100,148 104,158 115,158 106,165 110,175 100,169 90,175 94,165 85,158 96,158" fill="#ECC94B" stroke="#D69E2E" strokeWidth="1" />
        </g>
      );
    case 'lightning':
      return (
        <polygon points="96,143 106,143 102,156 110,156 94,178 98,163 90,163" fill="#ECC94B" stroke="#D69E2E" strokeWidth="1" />
      );
    default:
      return null;
  }
}

// ── Glasses on face ──
function Glasses({ cx, cy, s = 1 }) {
  return (
    <g>
      <circle cx={cx - 14 * s} cy={cy} r={10 * s} fill="none" stroke="#4A5568" strokeWidth={2.5 * s} />
      <circle cx={cx + 14 * s} cy={cy} r={10 * s} fill="none" stroke="#4A5568" strokeWidth={2.5 * s} />
      <line x1={cx - 4 * s} y1={cy} x2={cx + 4 * s} y2={cy} stroke="#4A5568" strokeWidth={2 * s} />
      <circle cx={cx - 14 * s} cy={cy} r={8 * s} fill="#63B3ED" opacity="0.15" />
      <circle cx={cx + 14 * s} cy={cy} r={8 * s} fill="#63B3ED" opacity="0.15" />
    </g>
  );
}

// ── Effect accessories (fire, sparkle) ──
function FireEffect({ animate }) {
  return (
    <g>
      {[{ x: 42, d: 0.8 }, { x: 56, d: 1.2 }, { x: 138, d: 1 }, { x: 152, d: 0.7 }].map((f, i) => (
        <g key={i}>
          <ellipse cx={f.x} cy={190} rx={6} ry={10} fill="#ED8936" opacity="0.7">
            {animate && <animate attributeName="ry" values="10;14;10" dur={`${f.d}s`} repeatCount="indefinite" />}
          </ellipse>
          <ellipse cx={f.x} cy={186} rx={4} ry={7} fill="#ECC94B" opacity="0.8">
            {animate && <animate attributeName="ry" values="7;11;7" dur={`${f.d * 0.8}s`} repeatCount="indefinite" />}
          </ellipse>
        </g>
      ))}
    </g>
  );
}

function SparkleEffect({ animate }) {
  const sparkles = [
    { x: 40, y: 100, size: 3, delay: 0 },
    { x: 160, y: 120, size: 4, delay: 0.5 },
    { x: 50, y: 170, size: 3, delay: 1 },
    { x: 150, y: 90, size: 3.5, delay: 0.3 },
    { x: 155, y: 175, size: 3, delay: 0.8 },
  ];
  return (
    <g>
      {sparkles.map((sp, i) => (
        <g key={i}>
          <line x1={sp.x - sp.size * 2} y1={sp.y} x2={sp.x + sp.size * 2} y2={sp.y} stroke="#ECC94B" strokeWidth="1.5" />
          <line x1={sp.x} y1={sp.y - sp.size * 2} x2={sp.x} y2={sp.y + sp.size * 2} stroke="#ECC94B" strokeWidth="1.5" />
          {animate && (
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin={`${sp.delay}s`} repeatCount="indefinite" />
          )}
        </g>
      ))}
    </g>
  );
}

// ── Wings for level 7+ ──
function Wings({ color, animate }) {
  return (
    <g opacity="0.8">
      {/* Left wing */}
      <path
        d={`M72 155 Q30 120 25 85 Q35 75 55 95 Q40 70 45 50 Q55 55 65 80 Q55 55 60 35 Q70 50 72 80 Q65 65 70 50 Q78 65 75 130 Z`}
        fill={color} stroke="white" strokeWidth="1" opacity="0.6"
      >
        {animate && <animateTransform attributeName="transform" type="rotate" values="-2 72 155;2 72 155;-2 72 155" dur="2s" repeatCount="indefinite" />}
      </path>
      {/* Right wing */}
      <path
        d={`M128 155 Q170 120 175 85 Q165 75 145 95 Q160 70 155 50 Q145 55 135 80 Q145 55 140 35 Q130 50 128 80 Q135 65 130 50 Q122 65 125 130 Z`}
        fill={color} stroke="white" strokeWidth="1" opacity="0.6"
      >
        {animate && <animateTransform attributeName="transform" type="rotate" values="2 128 155;-2 128 155;2 128 155" dur="2s" repeatCount="indefinite" />}
      </path>
    </g>
  );
}

// ── Shoulder armor for level 5+ ──
function ShoulderArmor({ color }) {
  return (
    <g>
      <ellipse cx={55} cy={142} rx={14} ry={10} fill={color} stroke="white" strokeWidth="1.5" opacity="0.8" />
      <ellipse cx={145} cy={142} rx={14} ry={10} fill={color} stroke="white" strokeWidth="1.5" opacity="0.8" />
      <ellipse cx={55} cy={140} rx={8} ry={5} fill="white" opacity="0.2" />
      <ellipse cx={145} cy={140} rx={8} ry={5} fill="white" opacity="0.2" />
    </g>
  );
}

// ── Color swatch for the shop ──
export function AvatarColorSwatch({ colorId, size = 32 }) {
  const skin = SKIN_COLORS[colorId] || SKIN_COLORS.default;
  if (skin.gradient) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id={`swatch-rainbow-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FC8181" />
            <stop offset="33%" stopColor="#F6E05E" />
            <stop offset="66%" stopColor="#68D391" />
            <stop offset="100%" stopColor="#63B3ED" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill={`url(#swatch-rainbow-${size})`} stroke={skin.outline} strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill={skin.base} stroke={skin.outline} strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="5" ry="4" fill={skin.light} opacity="0.4" />
    </svg>
  );
}

// ── Mini avatar head for shop previews ──
export function AvatarPreviewHead({ avatar, overrides = {}, size = 48 }) {
  const merged = { ...({ color: 'default', hat: 'none', accessory: 'none', face: 'happy' }), ...avatar, ...overrides };
  const skin = SKIN_COLORS[merged.color] || SKIN_COLORS.default;
  const fillColor = skin.gradient ? 'url(#preview-rainbow)' : skin.base;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {skin.gradient && (
        <defs>
          <linearGradient id="preview-rainbow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FC8181" />
            <stop offset="50%" stopColor="#F6E05E" />
            <stop offset="100%" stopColor="#63B3ED" />
          </linearGradient>
        </defs>
      )}
      <circle cx="50" cy="54" r="38" fill={fillColor} stroke={skin.outline} strokeWidth="2.5" />
      <ellipse cx="40" cy="44" rx="12" ry="8" fill={skin.light} opacity="0.3" />
      <Eyes expression={merged.face} cx={50} cy={50} s={0.85} />
      <Mouth expression={merged.face} cx={50} cy={66} s={0.85} />
      {merged.accessory === 'glasses' && <Glasses cx={50} cy={50} s={0.85} />}
      {merged.hat !== 'none' && <Hat type={merged.hat} cx={50} baseY={20} s={0.7} />}
      {/* Accessory effect indicators on preview head */}
      {merged.accessory === 'star' && (
        <polygon points="82,72 84,78 90,78 85,82 87,88 82,84 77,88 79,82 74,78 80,78" fill="#ECC94B" stroke="#D69E2E" strokeWidth="0.5" />
      )}
      {merged.accessory === 'lightning' && (
        <polygon points="82,70 87,70 84,78 89,78 78,92 81,82 76,82" fill="#ECC94B" stroke="#D69E2E" strokeWidth="0.5" />
      )}
      {merged.accessory === 'fire' && (
        <g>
          <ellipse cx="20" cy="68" rx="5" ry="9" fill="#ED8936" opacity="0.7" />
          <ellipse cx="20" cy="65" rx="3" ry="6" fill="#ECC94B" opacity="0.8" />
          <ellipse cx="80" cy="68" rx="5" ry="9" fill="#ED8936" opacity="0.7" />
          <ellipse cx="80" cy="65" rx="3" ry="6" fill="#ECC94B" opacity="0.8" />
        </g>
      )}
      {merged.accessory === 'sparkle' && (
        <g>
          <g>
            <line x1="16" y1="50" x2="24" y2="50" stroke="#ECC94B" strokeWidth="1.5" />
            <line x1="20" y1="46" x2="20" y2="54" stroke="#ECC94B" strokeWidth="1.5" />
          </g>
          <g>
            <line x1="76" y1="42" x2="84" y2="42" stroke="#ECC94B" strokeWidth="1.5" />
            <line x1="80" y1="38" x2="80" y2="46" stroke="#ECC94B" strokeWidth="1.5" />
          </g>
          <g>
            <line x1="22" y1="78" x2="28" y2="78" stroke="#ECC94B" strokeWidth="1" />
            <line x1="25" y1="75" x2="25" y2="81" stroke="#ECC94B" strokeWidth="1" />
          </g>
        </g>
      )}
    </svg>
  );
}

// ── Main Avatar3D Component ──
export default function Avatar3D({ avatar = {}, level = 1, size = 'md', animate = true, className = '' }) {
  const color = avatar.color || 'default';
  const hat = avatar.hat || 'none';
  const accessory = avatar.accessory || 'none';
  const face = avatar.face || 'happy';

  const skin = SKIN_COLORS[color] || SKIN_COLORS.default;
  const evo = getEvolution(level);
  const auraColor = getAuraColor(level);

  const sizeConfig = {
    sm: { width: 48, height: 48 },
    md: { width: 140, height: 200 },
    lg: { width: 200, height: 280 },
  }[size] || { width: 140, height: 200 };

  const fillColor = skin.gradient ? 'url(#rainbow-body)' : skin.base;
  const darkColor = skin.gradient ? 'url(#rainbow-body)' : skin.dark;
  const lightColor = skin.gradient ? 'url(#rainbow-body)' : skin.light;

  // ── Small (stats bar): head-only compact view ──
  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} style={{ width: 48, height: 48 }}>
        <svg viewBox="0 0 100 100" width="48" height="48" aria-label="Player avatar" role="img">
          {skin.gradient && (
            <defs>
              <linearGradient id="rainbow-sm" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FC8181" />
                <stop offset="50%" stopColor="#F6E05E" />
                <stop offset="100%" stopColor="#63B3ED" />
              </linearGradient>
            </defs>
          )}
          {/* Level glow ring */}
          {evo >= 2 && (
            <circle cx="50" cy="52" r="46" fill="none" stroke={auraColor} strokeWidth="3" opacity="0.5">
              {animate && <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />}
            </circle>
          )}
          {/* Head */}
          <circle cx="50" cy="52" r="36" fill={skin.gradient ? 'url(#rainbow-sm)' : skin.base} stroke={skin.outline} strokeWidth="2.5" />
          <ellipse cx="40" cy="42" rx="10" ry="7" fill={skin.light} opacity="0.3" />
          {/* Face */}
          <Eyes expression={face} cx={50} cy={48} s={0.78} />
          <Mouth expression={face} cx={50} cy={63} s={0.78} />
          {/* Glasses */}
          {accessory === 'glasses' && <Glasses cx={50} cy={48} s={0.78} />}
          {/* Hat */}
          {hat !== 'none' && <Hat type={hat} cx={50} baseY={20} s={0.65} />}
          {/* Accessory effect indicators */}
          {accessory === 'star' && (
            <polygon points="82,72 84,78 90,78 85,82 87,88 82,84 77,88 79,82 74,78 80,78" fill="#ECC94B" stroke="#D69E2E" strokeWidth="0.5" />
          )}
          {accessory === 'lightning' && (
            <polygon points="82,70 87,70 84,78 89,78 78,92 81,82 76,82" fill="#ECC94B" stroke="#D69E2E" strokeWidth="0.5" />
          )}
          {accessory === 'fire' && (
            <g>
              <ellipse cx="20" cy="68" rx="5" ry="9" fill="#ED8936" opacity="0.7" />
              <ellipse cx="20" cy="65" rx="3" ry="6" fill="#ECC94B" opacity="0.8" />
              <ellipse cx="80" cy="68" rx="5" ry="9" fill="#ED8936" opacity="0.7" />
              <ellipse cx="80" cy="65" rx="3" ry="6" fill="#ECC94B" opacity="0.8" />
            </g>
          )}
          {accessory === 'sparkle' && (
            <g>
              <g>
                <line x1="16" y1="50" x2="24" y2="50" stroke="#ECC94B" strokeWidth="1.5" />
                <line x1="20" y1="46" x2="20" y2="54" stroke="#ECC94B" strokeWidth="1.5" />
              </g>
              <g>
                <line x1="76" y1="42" x2="84" y2="42" stroke="#ECC94B" strokeWidth="1.5" />
                <line x1="80" y1="38" x2="80" y2="46" stroke="#ECC94B" strokeWidth="1.5" />
              </g>
              <g>
                <line x1="22" y1="78" x2="28" y2="78" stroke="#ECC94B" strokeWidth="1" />
                <line x1="25" y1="75" x2="25" y2="81" stroke="#ECC94B" strokeWidth="1" />
              </g>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // ── Medium / Large: full body character ──
  return (
    <div className={`inline-block ${animate ? 'avatar-3d-animate' : ''} ${className}`} style={{ width: sizeConfig.width, height: sizeConfig.height }}>
      <svg viewBox="0 0 200 300" width={sizeConfig.width} height={sizeConfig.height} aria-label="Player avatar" role="img">
        <defs>
          {skin.gradient && (
            <linearGradient id="rainbow-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FC8181" />
              <stop offset="33%" stopColor="#F6E05E" />
              <stop offset="66%" stopColor="#68D391" />
              <stop offset="100%" stopColor="#63B3ED" />
            </linearGradient>
          )}
          <radialGradient id="body-shade" cx="0.35" cy="0.3">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="black" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Background aura */}
        {evo >= 2 && (
          <ellipse cx="100" cy="160" rx={55 + evo * 12} ry={75 + evo * 12} fill={auraColor} opacity="0.1">
            {animate && <animate attributeName="opacity" values="0.06;0.16;0.06" dur="3s" repeatCount="indefinite" />}
          </ellipse>
        )}

        {/* Wings for evo 4 (level 7+) */}
        {evo >= 4 && <Wings color={auraColor} animate={animate} />}

        {/* Ground shadow */}
        <ellipse cx="100" cy="272" rx={28 + evo * 3} ry="6" fill="rgba(0,0,0,0.2)">
          {animate && evo >= 3 && <animate attributeName="rx" values={`${28 + evo * 3};${32 + evo * 3};${28 + evo * 3}`} dur="2.5s" repeatCount="indefinite" />}
        </ellipse>

        {/* Character group with float animation */}
        <g>
          {animate && evo >= 3 && (
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="2.5s" repeatCount="indefinite" />
          )}

          {/* Legs */}
          <rect x="80" y="210" width="16" height="42" rx="8" fill={darkColor} stroke={skin.outline} strokeWidth="1.5" />
          <rect x="104" y="210" width="16" height="42" rx="8" fill={darkColor} stroke={skin.outline} strokeWidth="1.5" />
          {/* Shoes */}
          <ellipse cx="88" cy="253" rx="13" ry="8" fill="#4A5568" stroke="#2D3748" strokeWidth="1.5" />
          <ellipse cx="112" cy="253" rx="13" ry="8" fill="#4A5568" stroke="#2D3748" strokeWidth="1.5" />
          <ellipse cx="91" cy="250" rx="5" ry="3" fill="#718096" opacity="0.4" />
          <ellipse cx="115" cy="250" rx="5" ry="3" fill="#718096" opacity="0.4" />

          {/* Body */}
          <rect x="68" y="135" width="64" height="80" rx="18" fill={fillColor} stroke={skin.outline} strokeWidth="2" />
          <rect x="68" y="135" width="64" height="80" rx="18" fill="url(#body-shade)" />

          {/* Belt / waistline detail */}
          <line x1="72" y1="188" x2="128" y2="188" stroke={skin.outline} strokeWidth="1.5" opacity="0.4" />

          {/* Outfit overlay */}
          <Outfit type={accessory} skin={skin} />

          {/* Shoulder armor for evo 3+ */}
          {evo >= 3 && <ShoulderArmor color={auraColor} />}

          {/* Arms */}
          <rect x="46" y="142" width="22" height="48" rx="11" fill={fillColor} stroke={skin.outline} strokeWidth="1.5" />
          <rect x="132" y="142" width="22" height="48" rx="11" fill={fillColor} stroke={skin.outline} strokeWidth="1.5" />
          <rect x="46" y="142" width="22" height="48" rx="11" fill="url(#body-shade)" />
          <rect x="132" y="142" width="22" height="48" rx="11" fill="url(#body-shade)" />
          {/* Hands */}
          <circle cx="57" cy="192" r="9" fill={lightColor} stroke={skin.outline} strokeWidth="1.5" />
          <circle cx="143" cy="192" r="9" fill={lightColor} stroke={skin.outline} strokeWidth="1.5" />

          {/* Head */}
          <circle cx="100" cy="88" r="48" fill={fillColor} stroke={skin.outline} strokeWidth="2.5" />
          <ellipse cx="85" cy="72" rx="16" ry="10" fill={skin.light} opacity="0.3" />
          <circle cx="100" cy="88" r="48" fill="url(#body-shade)" />

          {/* Face */}
          <Eyes expression={face} cx={100} cy={84} s={1} />
          <Mouth expression={face} cx={100} cy={104} s={1} />

          {/* Glasses */}
          {accessory === 'glasses' && <Glasses cx={100} cy={84} s={1} />}

          {/* Hat */}
          {hat !== 'none' && <Hat type={hat} cx={100} baseY={44} s={1} />}

          {/* Effect accessories */}
          {accessory === 'fire' && <FireEffect animate={animate} />}
          {accessory === 'sparkle' && <SparkleEffect animate={animate} />}
        </g>
      </svg>
    </div>
  );
}
