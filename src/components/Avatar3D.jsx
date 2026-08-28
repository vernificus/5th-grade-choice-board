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
  orange:  { base: '#F6AD55', dark: '#DD6B20', light: '#FEEBC8', outline: '#C05621' },
  teal:    { base: '#4FD1C5', dark: '#319795', light: '#B2F5EA', outline: '#285E61' },
  black:   { base: '#4A5568', dark: '#2D3748', light: '#A0AEC0', outline: '#1A202C' },
  white:   { base: '#F7FAFC', dark: '#CBD5E0', light: '#FFFFFF', outline: '#A0AEC0' },
  lava:    { base: '#FC8181', dark: '#C53030', light: '#FED7D7', outline: '#9B2C2C', gradient: true, gradientColors: ['#FC8181','#ED8936','#ECC94B'] },
  ice:     { base: '#BEE3F8', dark: '#63B3ED', light: '#EBF8FF', outline: '#3182CE', gradient: true, gradientColors: ['#BEE3F8','#90CDF4','#63B3ED'] },
  galaxy:  { base: '#B794F4', dark: '#553C9A', light: '#E9D8FD', outline: '#44337A', gradient: true, gradientColors: ['#805AD5','#D53F8C','#63B3ED'] },
};

function getEvolution(level) {
  if (level >= 20) return 6; // Godly - double wings + crown aura
  if (level >= 15) return 5; // Ascended - enhanced wings + particles
  if (level >= 7) return 4;  // Mythic wings
  if (level >= 5) return 3;  // Armor + float
  if (level >= 3) return 2;  // Aura glow
  return 1;
}

function getAuraColor(level) {
  if (level >= 20) return '#F6E05E'; // Gold
  if (level >= 15) return '#FC8181'; // Crimson
  if (level >= 10) return '#F687B3'; // Pink
  if (level >= 7) return '#B794F4';  // Purple
  if (level >= 6) return '#ED8936';
  if (level >= 5) return '#ECC94B';
  if (level >= 4) return '#B794F4';
  if (level >= 3) return '#63B3ED';
  return 'transparent';
}

// ── Blocky pixel-style Eyes ──
function Eyes({ expression, cx, cy, s = 1 }) {
  const px = 3 * s; // pixel unit
  switch (expression) {
    case 'cool':
      return (
        <g>
          {/* Sunglasses - blocky rectangles */}
          <rect x={cx - 22 * s} y={cy - 6 * s} width={18 * s} height={10 * s} fill="#1A202C" />
          <rect x={cx + 4 * s} y={cy - 6 * s} width={18 * s} height={10 * s} fill="#1A202C" />
          <rect x={cx - 4 * s} y={cy - 2 * s} width={8 * s} height={3 * s} fill="#1A202C" />
          <rect x={cx - 19 * s} y={cy - 4 * s} width={4 * s} height={3 * s} fill="#4299E1" opacity="0.5" />
          <rect x={cx + 7 * s} y={cy - 4 * s} width={4 * s} height={3 * s} fill="#4299E1" opacity="0.5" />
        </g>
      );
    case 'excited':
      return (
        <g>
          {/* Star eyes - blocky pixel stars */}
          <rect x={cx - 16 * s} y={cy - 3 * s} width={8 * s} height={px} fill="#ECC94B" />
          <rect x={cx - 13 * s} y={cy - 6 * s} width={px} height={9 * s} fill="#ECC94B" />
          <rect x={cx + 8 * s} y={cy - 3 * s} width={8 * s} height={px} fill="#ECC94B" />
          <rect x={cx + 11 * s} y={cy - 6 * s} width={px} height={9 * s} fill="#ECC94B" />
        </g>
      );
    case 'determined':
      return (
        <g>
          {/* Square determined eyes with angled brows */}
          <rect x={cx - 17 * s} y={cy - 3 * s} width={8 * s} height={8 * s} fill="#1A202C" />
          <rect x={cx + 9 * s} y={cy - 3 * s} width={8 * s} height={8 * s} fill="#1A202C" />
          <rect x={cx - 15 * s} y={cy - 1 * s} width={px} height={px} fill="white" />
          <rect x={cx + 13 * s} y={cy - 1 * s} width={px} height={px} fill="white" />
          {/* Angled brows */}
          <rect x={cx - 20 * s} y={cy - 10 * s} width={14 * s} height={3 * s} fill="#1A202C" transform={`rotate(8 ${cx - 13 * s} ${cy - 9 * s})`} />
          <rect x={cx + 6 * s} y={cy - 10 * s} width={14 * s} height={3 * s} fill="#1A202C" transform={`rotate(-8 ${cx + 13 * s} ${cy - 9 * s})`} />
        </g>
      );
    case 'smart':
      return (
        <g>
          {/* Square eyes with monocle */}
          <rect x={cx - 17 * s} y={cy - 3 * s} width={8 * s} height={8 * s} fill="#1A202C" />
          <rect x={cx + 9 * s} y={cy - 3 * s} width={8 * s} height={8 * s} fill="#1A202C" />
          <rect x={cx - 15 * s} y={cy - 1 * s} width={px} height={px} fill="white" />
          <rect x={cx + 13 * s} y={cy - 1 * s} width={px} height={px} fill="white" />
          {/* Monocle */}
          <rect x={cx + 6 * s} y={cy - 7 * s} width={16 * s} height={2 * s} fill="#D69E2E" />
          <rect x={cx + 6 * s} y={cy + 7 * s} width={16 * s} height={2 * s} fill="#D69E2E" />
          <rect x={cx + 5 * s} y={cy - 5 * s} width={2 * s} height={12 * s} fill="#D69E2E" />
          <rect x={cx + 21 * s} y={cy - 5 * s} width={2 * s} height={12 * s} fill="#D69E2E" />
          <rect x={cx + 13 * s} y={cy + 9 * s} width={2 * s} height={12 * s} fill="#D69E2E" />
        </g>
      );
    case 'ninja':
      return (
        <g>
          {/* Narrow slit eyes */}
          <rect x={cx - 20 * s} y={cy - 2 * s} width={14 * s} height={3 * s} fill="#1A202C" />
          <rect x={cx + 6 * s} y={cy - 2 * s} width={14 * s} height={3 * s} fill="#1A202C" />
        </g>
      );
    case 'wink':
      return (
        <g>
          {/* One open square eye, one shut */}
          <rect x={cx - 17 * s} y={cy - 3 * s} width={8 * s} height={8 * s} fill="#1A202C" />
          <rect x={cx - 15 * s} y={cy - 1 * s} width={px} height={px} fill="white" />
          {/* Wink eye - horizontal line */}
          <rect x={cx + 9 * s} y={cy} width={8 * s} height={3 * s} fill="#1A202C" />
        </g>
      );
    case 'angry':
      return (
        <g>
          {/* Angry eyes */}
          <rect x={cx - 17 * s} y={cy - 2 * s} width={8 * s} height={6 * s} fill="#E53E3E" />
          <rect x={cx + 9 * s} y={cy - 2 * s} width={8 * s} height={6 * s} fill="#E53E3E" />
          <rect x={cx - 15 * s} y={cy} width={px} height={px} fill="#1A202C" />
          <rect x={cx + 13 * s} y={cy} width={px} height={px} fill="#1A202C" />
          {/* V brows */}
          <rect x={cx - 20 * s} y={cy - 10 * s} width={14 * s} height={3 * s} fill="#1A202C" transform={`rotate(15 ${cx - 13 * s} ${cy - 9 * s})`} />
          <rect x={cx + 6 * s} y={cy - 10 * s} width={14 * s} height={3 * s} fill="#1A202C" transform={`rotate(-15 ${cx + 13 * s} ${cy - 9 * s})`} />
        </g>
      );
    case 'sleepy':
      return (
        <g>
          {/* Half-closed eyes */}
          <rect x={cx - 17 * s} y={cy} width={8 * s} height={3 * s} fill="#1A202C" />
          <rect x={cx + 9 * s} y={cy} width={8 * s} height={3 * s} fill="#1A202C" />
          <rect x={cx - 17 * s} y={cy - 2 * s} width={8 * s} height={2 * s} fill="#1A202C" opacity="0.3" />
          <rect x={cx + 9 * s} y={cy - 2 * s} width={8 * s} height={2 * s} fill="#1A202C" opacity="0.3" />
        </g>
      );
    default: // happy
      return (
        <g>
          {/* Simple square pixel eyes */}
          <rect x={cx - 17 * s} y={cy - 3 * s} width={8 * s} height={8 * s} fill="#1A202C" />
          <rect x={cx + 9 * s} y={cy - 3 * s} width={8 * s} height={8 * s} fill="#1A202C" />
          <rect x={cx - 15 * s} y={cy - 1 * s} width={px} height={px} fill="white" />
          <rect x={cx + 13 * s} y={cy - 1 * s} width={px} height={px} fill="white" />
        </g>
      );
  }
}

// ── Blocky Mouth ──
function Mouth({ expression, cx, cy, s = 1 }) {
  switch (expression) {
    case 'cool':
      return <rect x={cx - 8 * s} y={cy - 1 * s} width={16 * s} height={3 * s} fill="#1A202C" />;
    case 'excited':
      return (
        <g>
          <rect x={cx - 8 * s} y={cy - 2 * s} width={16 * s} height={10 * s} fill="#1A202C" />
          <rect x={cx - 6 * s} y={cy - 1 * s} width={12 * s} height={3 * s} fill="#FC8181" />
        </g>
      );
    case 'determined':
      return <rect x={cx - 8 * s} y={cy} width={16 * s} height={3 * s} fill="#1A202C" />;
    case 'smart':
      return (
        <g>
          <rect x={cx - 6 * s} y={cy} width={12 * s} height={3 * s} fill="#1A202C" />
          <rect x={cx - 4 * s} y={cy + 3 * s} width={8 * s} height={2 * s} fill="#1A202C" />
        </g>
      );
    case 'ninja':
      return <rect x={cx - 22 * s} y={cy - 4 * s} width={44 * s} height={10 * s} fill="#4A5568" opacity="0.9" />;
    case 'wink':
      return (
        <g>
          <rect x={cx - 6 * s} y={cy} width={12 * s} height={3 * s} fill="#1A202C" />
          <rect x={cx + 2 * s} y={cy + 3 * s} width={6 * s} height={2 * s} fill="#1A202C" />
        </g>
      );
    case 'angry':
      return (
        <g>
          <rect x={cx - 8 * s} y={cy} width={16 * s} height={4 * s} fill="#1A202C" />
          <rect x={cx - 6 * s} y={cy + 1 * s} width={3 * s} height={2 * s} fill="white" />
          <rect x={cx + 3 * s} y={cy + 1 * s} width={3 * s} height={2 * s} fill="white" />
        </g>
      );
    case 'sleepy':
      return (
        <g>
          <rect x={cx - 4 * s} y={cy} width={8 * s} height={6 * s} fill="#1A202C" />
        </g>
      );
    default: // happy
      return (
        <g>
          <rect x={cx - 8 * s} y={cy} width={16 * s} height={3 * s} fill="#1A202C" />
          <rect x={cx - 6 * s} y={cy + 3 * s} width={12 * s} height={3 * s} fill="#1A202C" />
        </g>
      );
  }
}

// ── Blocky Hats ──
function Hat({ type, cx, baseY, s = 1 }) {
  switch (type) {
    case 'cap':
      return (
        <g>
          <rect x={cx - 30 * s} y={baseY} width={60 * s} height={8 * s} fill="#E53E3E" stroke="#C53030" strokeWidth={1 * s} />
          <rect x={cx - 24 * s} y={baseY - 18 * s} width={48 * s} height={18 * s} fill="#E53E3E" stroke="#C53030" strokeWidth={1 * s} />
          <rect x={cx + 24 * s} y={baseY + 2 * s} width={16 * s} height={5 * s} fill="#C53030" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <rect x={cx - 24 * s} y={baseY - 2 * s} width={48 * s} height={14 * s} fill="#D69E2E" stroke="#B7791F" strokeWidth={1 * s} />
          {/* Crown points - blocky triangles */}
          <rect x={cx - 22 * s} y={baseY - 10 * s} width={6 * s} height={8 * s} fill="#ECC94B" />
          <rect x={cx - 3 * s} y={baseY - 16 * s} width={6 * s} height={14 * s} fill="#ECC94B" />
          <rect x={cx + 16 * s} y={baseY - 10 * s} width={6 * s} height={8 * s} fill="#ECC94B" />
          {/* Gems */}
          <rect x={cx - 2 * s} y={baseY + 2 * s} width={4 * s} height={4 * s} fill="#E53E3E" />
          <rect x={cx - 14 * s} y={baseY + 3 * s} width={3 * s} height={3 * s} fill="#63B3ED" />
          <rect x={cx + 11 * s} y={baseY + 3 * s} width={3 * s} height={3 * s} fill="#63B3ED" />
        </g>
      );
    case 'wizard':
      return (
        <g>
          <rect x={cx - 32 * s} y={baseY + 2 * s} width={64 * s} height={8 * s} fill="#553C9A" stroke="#44337A" strokeWidth={1 * s} />
          {/* Blocky wizard hat cone */}
          <rect x={cx - 24 * s} y={baseY - 8 * s} width={48 * s} height={10 * s} fill="#6B46C1" />
          <rect x={cx - 18 * s} y={baseY - 20 * s} width={36 * s} height={12 * s} fill="#6B46C1" />
          <rect x={cx - 10 * s} y={baseY - 32 * s} width={20 * s} height={12 * s} fill="#6B46C1" />
          <rect x={cx - 4 * s} y={baseY - 40 * s} width={8 * s} height={8 * s} fill="#6B46C1" />
          {/* Star on tip */}
          <rect x={cx - 2 * s} y={baseY - 44 * s} width={4 * s} height={4 * s} fill="#ECC94B" />
          {/* Star decorations */}
          <rect x={cx - 8 * s} y={baseY - 16 * s} width={3 * s} height={3 * s} fill="#ECC94B" opacity="0.7" />
          <rect x={cx + 8 * s} y={baseY - 6 * s} width={3 * s} height={3 * s} fill="#ECC94B" opacity="0.5" />
        </g>
      );
    case 'party':
      return (
        <g>
          {/* Blocky party hat */}
          <rect x={cx - 16 * s} y={baseY - 4 * s} width={32 * s} height={8 * s} fill="#ED64A6" stroke="#D53F8C" strokeWidth={1 * s} />
          <rect x={cx - 12 * s} y={baseY - 16 * s} width={24 * s} height={12 * s} fill="#ED64A6" />
          <rect x={cx - 6 * s} y={baseY - 28 * s} width={12 * s} height={12 * s} fill="#ED64A6" />
          <rect x={cx - 3 * s} y={baseY - 34 * s} width={6 * s} height={6 * s} fill="#ED64A6" />
          {/* Stripes */}
          <rect x={cx - 10 * s} y={baseY - 12 * s} width={20 * s} height={3 * s} fill="#ECC94B" />
          <rect x={cx - 5 * s} y={baseY - 24 * s} width={10 * s} height={3 * s} fill="#63B3ED" />
          {/* Pom pom */}
          <rect x={cx - 4 * s} y={baseY - 38 * s} width={8 * s} height={4 * s} fill="#ECC94B" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          {/* Blocky headband */}
          <rect x={cx - 32 * s} y={baseY - 16 * s} width={64 * s} height={6 * s} fill="#2D3748" />
          <rect x={cx - 34 * s} y={baseY - 10 * s} width={6 * s} height={16 * s} fill="#2D3748" />
          <rect x={cx + 28 * s} y={baseY - 10 * s} width={6 * s} height={16 * s} fill="#2D3748" />
          {/* Ear cups */}
          <rect x={cx - 40 * s} y={baseY + 2 * s} width={14 * s} height={18 * s} fill="#4A5568" stroke="#2D3748" strokeWidth={1 * s} />
          <rect x={cx + 26 * s} y={baseY + 2 * s} width={14 * s} height={18 * s} fill="#4A5568" stroke="#2D3748" strokeWidth={1 * s} />
          {/* Accents */}
          <rect x={cx - 37 * s} y={baseY + 6 * s} width={6 * s} height={10 * s} fill="#68D391" />
          <rect x={cx + 30 * s} y={baseY + 6 * s} width={6 * s} height={10 * s} fill="#68D391" />
        </g>
      );
    case 'tophat':
      return (
        <g>
          <rect x={cx - 30 * s} y={baseY} width={60 * s} height={6 * s} fill="#2D3748" stroke="#1A202C" strokeWidth={1 * s} />
          <rect x={cx - 18 * s} y={baseY - 36 * s} width={36 * s} height={36 * s} fill="#2D3748" stroke="#1A202C" strokeWidth={1 * s} />
          <rect x={cx - 18 * s} y={baseY - 8 * s} width={36 * s} height={4 * s} fill="#D69E2E" />
        </g>
      );
    case 'viking':
      return (
        <g>
          <rect x={cx - 28 * s} y={baseY} width={56 * s} height={14 * s} fill="#8B6914" stroke="#6B4F12" strokeWidth={1 * s} />
          <rect x={cx - 22 * s} y={baseY - 6 * s} width={44 * s} height={6 * s} fill="#A0781E" />
          {/* Horns - blocky */}
          <rect x={cx - 36 * s} y={baseY - 8 * s} width={10 * s} height={6 * s} fill="#F7FAFC" />
          <rect x={cx - 40 * s} y={baseY - 20 * s} width={8 * s} height={12 * s} fill="#F7FAFC" />
          <rect x={cx - 38 * s} y={baseY - 26 * s} width={4 * s} height={6 * s} fill="#F7FAFC" />
          <rect x={cx + 26 * s} y={baseY - 8 * s} width={10 * s} height={6 * s} fill="#F7FAFC" />
          <rect x={cx + 32 * s} y={baseY - 20 * s} width={8 * s} height={12 * s} fill="#F7FAFC" />
          <rect x={cx + 34 * s} y={baseY - 26 * s} width={4 * s} height={6 * s} fill="#F7FAFC" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <rect x={cx - 26 * s} y={baseY - 2 * s} width={52 * s} height={8 * s} fill="#E53E3E" />
          <rect x={cx - 24 * s} y={baseY - 14 * s} width={48 * s} height={12 * s} fill="#38A169" />
          <rect x={cx - 20 * s} y={baseY - 22 * s} width={40 * s} height={8 * s} fill="#E53E3E" />
          <rect x={cx - 14 * s} y={baseY - 26 * s} width={28 * s} height={4 * s} fill="#38A169" />
          {/* Pom */}
          <rect x={cx - 6 * s} y={baseY - 32 * s} width={12 * s} height={6 * s} fill="#F7FAFC" />
        </g>
      );
    case 'dragon_horns':
      return (
        <g>
          {/* Fire Dragon Horns */}
          <rect x={cx - 28 * s} y={baseY - 2 * s} width={56 * s} height={6 * s} fill="#C53030" stroke="#9B2C2C" strokeWidth={1 * s} />
          {/* Left Horn */}
          <rect x={cx - 26 * s} y={baseY - 10 * s} width={8 * s} height={8 * s} fill="#E53E3E" />
          <rect x={cx - 30 * s} y={baseY - 20 * s} width={8 * s} height={10 * s} fill="#DD6B20" />
          <rect x={cx - 32 * s} y={baseY - 28 * s} width={6 * s} height={8 * s} fill="#ECC94B" />
          {/* Right Horn */}
          <rect x={cx + 18 * s} y={baseY - 10 * s} width={8 * s} height={8 * s} fill="#E53E3E" />
          <rect x={cx + 22 * s} y={baseY - 20 * s} width={8 * s} height={10 * s} fill="#DD6B20" />
          <rect x={cx + 26 * s} y={baseY - 28 * s} width={6 * s} height={8 * s} fill="#ECC94B" />
        </g>
      );
    case 'wolf_cowl':
      return (
        <g>
          {/* Shadow Wolf Ears & Hood */}
          <rect x={cx - 26 * s} y={baseY - 6 * s} width={52 * s} height={12 * s} fill="#553C9A" />
          {/* Left Ear */}
          <rect x={cx - 24 * s} y={baseY - 16 * s} width={10 * s} height={10 * s} fill="#6B46C1" />
          <rect x={cx - 22 * s} y={baseY - 24 * s} width={6 * s} height={8 * s} fill="#805AD5" />
          <rect x={cx - 20 * s} y={baseY - 12 * s} width={4 * s} height={6 * s} fill="#D6BCFA" />
          {/* Right Ear */}
          <rect x={cx + 14 * s} y={baseY - 16 * s} width={10 * s} height={10 * s} fill="#6B46C1" />
          <rect x={cx + 16 * s} y={baseY - 24 * s} width={6 * s} height={8 * s} fill="#805AD5" />
          <rect x={cx + 16 * s} y={baseY - 12 * s} width={4 * s} height={6 * s} fill="#D6BCFA" />
        </g>
      );
    case 'phoenix_crest':
      return (
        <g>
          {/* Golden Phoenix Flame Crest */}
          <rect x={cx - 22 * s} y={baseY - 2 * s} width={44 * s} height={6 * s} fill="#D69E2E" />
          <rect x={cx - 14 * s} y={baseY - 12 * s} width={28 * s} height={10 * s} fill="#ECC94B" />
          <rect x={cx - 8 * s} y={baseY - 24 * s} width={16 * s} height={12 * s} fill="#ED8936" />
          <rect x={cx - 4 * s} y={baseY - 34 * s} width={8 * s} height={10 * s} fill="#E53E3E" />
        </g>
      );
    case 'shark_fin':
      return (
        <g>
          {/* Ocean Shark Fin Helm */}
          <rect x={cx - 26 * s} y={baseY} width={52 * s} height={8 * s} fill="#2B6CB0" stroke="#2C5282" strokeWidth={1 * s} />
          {/* Center Fin */}
          <rect x={cx - 6 * s} y={baseY - 12 * s} width={12 * s} height={12 * s} fill="#3182CE" />
          <rect x={cx - 4 * s} y={baseY - 24 * s} width={8 * s} height={12 * s} fill="#4299E1" />
          <rect x={cx - 2 * s} y={baseY - 32 * s} width={4 * s} height={8 * s} fill="#63B3ED" />
        </g>
      );
    case 'mythic_crown':
      return (
        <g>
          {/* Mythic Tier 10 Guild Crown */}
          <rect x={cx - 26 * s} y={baseY - 4 * s} width={52 * s} height={14 * s} fill="#D69E2E" stroke="#ECC94B" strokeWidth={1.5 * s} />
          <rect x={cx - 24 * s} y={baseY - 16 * s} width={8 * s} height={12 * s} fill="#ECC94B" />
          <rect x={cx - 4 * s} y={baseY - 24 * s} width={8 * s} height={20 * s} fill="#F6E05E" />
          <rect x={cx + 16 * s} y={baseY - 16 * s} width={8 * s} height={12 * s} fill="#ECC94B" />
          {/* Large Gem */}
          <rect x={cx - 3 * s} y={baseY - 2 * s} width={6 * s} height={6 * s} fill="#9F7AEA" />
          <rect x={cx - 18 * s} y={baseY - 1 * s} width={4 * s} height={4 * s} fill="#3182CE" />
          <rect x={cx + 14 * s} y={baseY - 1 * s} width={4 * s} height={4 * s} fill="#E53E3E" />
        </g>
      );
    default:
      return null;
  }
}

// ── Blocky Outfit overlays on body ──
function Outfit({ type, skin }) {
  switch (type) {
    case 'star':
      return (
        <g>
          {/* Pixelated star badge */}
          <rect x="96" y="152" width="8" height="4" fill="#ECC94B" />
          <rect x="92" y="156" width="16" height="4" fill="#ECC94B" />
          <rect x="94" y="160" width="12" height="4" fill="#ECC94B" />
          <rect x="92" y="164" width="6" height="4" fill="#ECC94B" />
          <rect x="102" y="164" width="6" height="4" fill="#ECC94B" />
        </g>
      );
    case 'lightning':
      return (
        <g>
          {/* Pixelated lightning bolt on chest */}
          <rect x="100" y="146" width="8" height="4" fill="#ECC94B" />
          <rect x="96" y="150" width="8" height="4" fill="#ECC94B" />
          <rect x="94" y="154" width="14" height="4" fill="#ECC94B" />
          <rect x="98" y="158" width="8" height="4" fill="#ECC94B" />
          <rect x="94" y="162" width="8" height="4" fill="#ECC94B" />
          <rect x="90" y="166" width="8" height="4" fill="#ECC94B" />
        </g>
      );
    case 'cape':
      return (
        <g>
          {/* Cape flowing behind */}
          <rect x="72" y="140" width="4" height="70" fill="#E53E3E" opacity="0.8" />
          <rect x="68" y="150" width="4" height="56" fill="#E53E3E" opacity="0.6" />
          <rect x="124" y="140" width="4" height="70" fill="#E53E3E" opacity="0.8" />
          <rect x="128" y="150" width="4" height="56" fill="#E53E3E" opacity="0.6" />
          <rect x="72" y="138" width="56" height="4" fill="#D69E2E" />
        </g>
      );
    case 'guild_cloak':
      return (
        <g>
          {/* Royal Guild Banner Cloak */}
          <rect x="70" y="138" width="6" height="74" fill="#805AD5" opacity="0.9" />
          <rect x="66" y="148" width="6" height="60" fill="#6B46C1" opacity="0.7" />
          <rect x="124" y="138" width="6" height="74" fill="#805AD5" opacity="0.9" />
          <rect x="128" y="148" width="6" height="60" fill="#6B46C1" opacity="0.7" />
          <rect x="70" y="136" width="60" height="5" fill="#ECC94B" />
          <rect x="96" y="152" width="8" height="12" fill="#ECC94B" />
        </g>
      );
    case 'phoenix_wings':
      return (
        <g>
          {/* Phoenix Fire Wings */}
          <rect x="56" y="130" width="12" height="6" fill="#ED8936" opacity="0.9" />
          <rect x="48" y="136" width="16" height="10" fill="#E53E3E" opacity="0.8" />
          <rect x="42" y="146" width="18" height="14" fill="#DD6B20" opacity="0.7" />
          <rect x="132" y="130" width="12" height="6" fill="#ED8936" opacity="0.9" />
          <rect x="136" y="136" width="16" height="10" fill="#E53E3E" opacity="0.8" />
          <rect x="140" y="146" width="18" height="14" fill="#DD6B20" opacity="0.7" />
        </g>
      );
    case 'shield':
      return (
        <g>
          {/* Pixel shield on chest */}
          <rect x="88" y="148" width="24" height="4" fill="#4A5568" />
          <rect x="86" y="152" width="28" height="16" fill="#4A5568" />
          <rect x="88" y="168" width="24" height="4" fill="#4A5568" />
          <rect x="92" y="172" width="16" height="4" fill="#4A5568" />
          <rect x="96" y="176" width="8" height="4" fill="#4A5568" />
          {/* Cross emblem */}
          <rect x="96" y="154" width="8" height="14" fill="#E53E3E" />
          <rect x="92" y="158" width="16" height="4" fill="#E53E3E" />
        </g>
      );
    default:
      return null;
  }
}

// ── Blocky Glasses on face ──
function Glasses({ cx, cy, s = 1 }) {
  return (
    <g>
      <rect x={cx - 22 * s} y={cy - 8 * s} width={18 * s} height={14 * s} fill="none" stroke="#4A5568" strokeWidth={2.5 * s} />
      <rect x={cx + 4 * s} y={cy - 8 * s} width={18 * s} height={14 * s} fill="none" stroke="#4A5568" strokeWidth={2.5 * s} />
      <rect x={cx - 4 * s} y={cy - 1 * s} width={8 * s} height={2 * s} fill="#4A5568" />
      <rect x={cx - 20 * s} y={cy - 6 * s} width={14 * s} height={10 * s} fill="#63B3ED" opacity="0.15" />
      <rect x={cx + 6 * s} y={cy - 6 * s} width={14 * s} height={10 * s} fill="#63B3ED" opacity="0.15" />
    </g>
  );
}

// ── Blocky pixel effect accessories ──
function FireEffect({ animate }) {
  return (
    <g>
      {[{ x: 44, d: 0.8 }, { x: 56, d: 1.2 }, { x: 138, d: 1 }, { x: 152, d: 0.7 }].map((f, i) => (
        <g key={i}>
          <rect x={f.x - 4} y={180} width={8} height={16} fill="#ED8936" opacity="0.7">
            {animate && <animate attributeName="height" values="16;22;16" dur={`${f.d}s`} repeatCount="indefinite" />}
          </rect>
          <rect x={f.x - 3} y={176} width={6} height={12} fill="#ECC94B" opacity="0.8">
            {animate && <animate attributeName="height" values="12;18;12" dur={`${f.d * 0.8}s`} repeatCount="indefinite" />}
          </rect>
          <rect x={f.x - 2} y={174} width={4} height={6} fill="#FEFCBF" opacity="0.9">
            {animate && <animate attributeName="height" values="6;10;6" dur={`${f.d * 0.6}s`} repeatCount="indefinite" />}
          </rect>
        </g>
      ))}
    </g>
  );
}

function SparkleEffect({ animate }) {
  const sparkles = [
    { x: 40, y: 100, size: 4, delay: 0 },
    { x: 160, y: 120, size: 5, delay: 0.5 },
    { x: 50, y: 170, size: 4, delay: 1 },
    { x: 150, y: 90, size: 4, delay: 0.3 },
    { x: 155, y: 175, size: 3, delay: 0.8 },
  ];
  return (
    <g>
      {sparkles.map((sp, i) => (
        <g key={i}>
          {/* Pixel cross sparkle */}
          <rect x={sp.x - sp.size} y={sp.y - 1} width={sp.size * 2} height={2} fill="#ECC94B" />
          <rect x={sp.x - 1} y={sp.y - sp.size} width={2} height={sp.size * 2} fill="#ECC94B" />
          {animate && (
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin={`${sp.delay}s`} repeatCount="indefinite" />
          )}
        </g>
      ))}
    </g>
  );
}

function LightningEffect({ animate }) {
  return (
    <g>
      {[{ x: 42, delay: 0 }, { x: 152, delay: 0.4 }].map((b, i) => (
        <g key={i} opacity="0.8">
          <rect x={b.x} y={80} width={6} height={10} fill="#ECC94B">
            {animate && <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.5s" begin={`${b.delay}s`} repeatCount="indefinite" />}
          </rect>
          <rect x={b.x - 2} y={90} width={8} height={4} fill="#ECC94B">
            {animate && <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.5s" begin={`${b.delay}s`} repeatCount="indefinite" />}
          </rect>
          <rect x={b.x + 2} y={94} width={6} height={10} fill="#ECC94B">
            {animate && <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.5s" begin={`${b.delay}s`} repeatCount="indefinite" />}
          </rect>
        </g>
      ))}
    </g>
  );
}

// ── Blocky Wings for level 7+ ──
function Wings({ color, animate }) {
  return (
    <g opacity="0.75">
      {/* Left wing - blocky pixel steps */}
      <g>
        <rect x={30} y={130} width={40} height={8} fill={color} />
        <rect x={22} y={118} width={42} height={12} fill={color} />
        <rect x={18} y={104} width={38} height={14} fill={color} />
        <rect x={24} y={90} width={28} height={14} fill={color} />
        <rect x={32} y={80} width={16} height={10} fill={color} />
        <rect x={38} y={74} width={8} height={6} fill={color} />
        {/* Highlight */}
        <rect x={32} y={108} width={20} height={4} fill="white" opacity="0.3" />
        {animate && <animateTransform attributeName="transform" type="translate" values="0,0;-2,-1;0,0" dur="2s" repeatCount="indefinite" />}
      </g>
      {/* Right wing */}
      <g>
        <rect x={130} y={130} width={40} height={8} fill={color} />
        <rect x={136} y={118} width={42} height={12} fill={color} />
        <rect x={144} y={104} width={38} height={14} fill={color} />
        <rect x={148} y={90} width={28} height={14} fill={color} />
        <rect x={152} y={80} width={16} height={10} fill={color} />
        <rect x={154} y={74} width={8} height={6} fill={color} />
        {/* Highlight */}
        <rect x={148} y={108} width={20} height={4} fill="white" opacity="0.3" />
        {animate && <animateTransform attributeName="transform" type="translate" values="0,0;2,-1;0,0" dur="2s" repeatCount="indefinite" />}
      </g>
    </g>
  );
}

// ── Blocky Shoulder armor for level 5+ ──
function ShoulderArmor({ color }) {
  return (
    <g>
      <rect x={42} y={134} width={22} height={14} fill={color} stroke="white" strokeWidth="1" opacity="0.8" />
      <rect x={136} y={134} width={22} height={14} fill={color} stroke="white" strokeWidth="1" opacity="0.8" />
      {/* Highlights */}
      <rect x={44} y={136} width={10} height={4} fill="white" opacity="0.2" />
      <rect x={138} y={136} width={10} height={4} fill="white" opacity="0.2" />
    </g>
  );
}

// ── Color swatch for the shop ──
export function AvatarColorSwatch({ colorId, size = 32 }) {
  const skin = SKIN_COLORS[colorId] || SKIN_COLORS.default;
  const gradientColors = skin.gradientColors || ['#FC8181', '#F6E05E', '#68D391', '#63B3ED'];
  if (skin.gradient) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id={`swatch-grad-${colorId}-${size}`} x1="0" y1="0" x2="1" y2="1">
            {gradientColors.map((c, i) => (
              <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" fill={`url(#swatch-grad-${colorId}-${size})`} stroke={skin.outline} strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" fill={skin.base} stroke={skin.outline} strokeWidth="2" />
      <rect x="4" y="4" width="10" height="8" fill={skin.light} opacity="0.4" />
    </svg>
  );
}

// ── Mini avatar head for shop previews (blocky) ──
export function AvatarPreviewHead({ avatar, overrides = {}, size = 48 }) {
  const merged = { ...({ color: 'default', hat: 'none', accessory: 'none', face: 'happy' }), ...avatar, ...overrides };
  const skin = SKIN_COLORS[merged.color] || SKIN_COLORS.default;
  const gradientColors = skin.gradientColors || ['#FC8181', '#F6E05E', '#63B3ED'];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {skin.gradient && (
        <defs>
          <linearGradient id={`preview-grad-${merged.color}`} x1="0" y1="0" x2="1" y2="1">
            {gradientColors.map((c, i) => (
              <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
      )}
      {/* Blocky square head */}
      <rect x="14" y="16" width="72" height="72" fill={skin.gradient ? `url(#preview-grad-${merged.color})` : skin.base} stroke={skin.outline} strokeWidth="2.5" />
      {/* Highlight */}
      <rect x="18" y="20" width="20" height="14" fill={skin.light} opacity="0.3" />
      <Eyes expression={merged.face} cx={50} cy={50} s={0.85} />
      <Mouth expression={merged.face} cx={50} cy={66} s={0.85} />
      {merged.accessory === 'glasses' && <Glasses cx={50} cy={50} s={0.85} />}
      {merged.hat !== 'none' && <Hat type={merged.hat} cx={50} baseY={20} s={0.7} />}
      {/* Accessory indicators */}
      {merged.accessory === 'star' && (
        <g>
          <rect x="78" y="74" width="8" height="4" fill="#ECC94B" />
          <rect x="80" y="70" width="4" height="12" fill="#ECC94B" />
        </g>
      )}
      {merged.accessory === 'lightning' && (
        <g>
          <rect x="78" y="70" width="8" height="4" fill="#ECC94B" />
          <rect x="76" y="74" width="8" height="4" fill="#ECC94B" />
          <rect x="80" y="78" width="8" height="4" fill="#ECC94B" />
        </g>
      )}
      {merged.accessory === 'fire' && (
        <g>
          <rect x="14" y="64" width="6" height="12" fill="#ED8936" opacity="0.7" />
          <rect x="15" y="60" width="4" height="8" fill="#ECC94B" opacity="0.8" />
          <rect x="80" y="64" width="6" height="12" fill="#ED8936" opacity="0.7" />
          <rect x="81" y="60" width="4" height="8" fill="#ECC94B" opacity="0.8" />
        </g>
      )}
      {merged.accessory === 'sparkle' && (
        <g>
          <rect x="14" y="48" width="8" height="2" fill="#ECC94B" />
          <rect x="17" y="45" width="2" height="8" fill="#ECC94B" />
          <rect x="78" y="40" width="8" height="2" fill="#ECC94B" />
          <rect x="81" y="37" width="2" height="8" fill="#ECC94B" />
        </g>
      )}
      {merged.accessory === 'cape' && (
        <g>
          <rect x="14" y="80" width="4" height="8" fill="#E53E3E" opacity="0.6" />
          <rect x="82" y="80" width="4" height="8" fill="#E53E3E" opacity="0.6" />
        </g>
      )}
      {merged.accessory === 'shield' && (
        <g>
          <rect x="76" y="68" width="12" height="14" fill="#4A5568" />
          <rect x="78" y="82" width="8" height="4" fill="#4A5568" />
          <rect x="80" y="72" width="4" height="8" fill="#E53E3E" />
        </g>
      )}
    </svg>
  );
}

// ── Main Avatar3D Component (Blocky Minecraft-style) ──
export default function Avatar3D({ avatar = {}, level = 1, size = 'md', animate = true, className = '' }) {
  const color = avatar.color || 'default';
  const hat = avatar.hat || 'none';
  const accessory = avatar.accessory || 'none';
  const face = avatar.face || 'happy';

  const skin = SKIN_COLORS[color] || SKIN_COLORS.default;
  const evo = getEvolution(level);
  const auraColor = getAuraColor(level);
  const gradientColors = skin.gradientColors || ['#FC8181', '#F6E05E', '#68D391', '#63B3ED'];

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
              <linearGradient id={`rainbow-sm-${color}`} x1="0" y1="0" x2="1" y2="1">
                {gradientColors.map((c, i) => (
                  <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
            </defs>
          )}
          {/* Level glow - blocky */}
          {evo >= 2 && (
            <rect x="4" y="6" width="92" height="92" fill="none" stroke={auraColor} strokeWidth="3" opacity="0.5">
              {animate && <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />}
            </rect>
          )}
          {/* Blocky Head */}
          <rect x="14" y="16" width="72" height="72" fill={skin.gradient ? `url(#rainbow-sm-${color})` : skin.base} stroke={skin.outline} strokeWidth="2.5" />
          <rect x="18" y="20" width="20" height="14" fill={skin.light} opacity="0.3" />
          {/* Face */}
          <Eyes expression={face} cx={50} cy={48} s={0.78} />
          <Mouth expression={face} cx={50} cy={63} s={0.78} />
          {/* Glasses */}
          {accessory === 'glasses' && <Glasses cx={50} cy={48} s={0.78} />}
          {/* Hat */}
          {hat !== 'none' && <Hat type={hat} cx={50} baseY={20} s={0.65} />}
          {/* Accessory indicators */}
          {accessory === 'star' && (
            <g>
              <rect x="80" y="74" width="8" height="3" fill="#ECC94B" />
              <rect x="82" y="71" width="3" height="9" fill="#ECC94B" />
            </g>
          )}
          {accessory === 'lightning' && (
            <g>
              <rect x="78" y="70" width="8" height="4" fill="#ECC94B" />
              <rect x="76" y="74" width="8" height="4" fill="#ECC94B" />
              <rect x="80" y="78" width="8" height="4" fill="#ECC94B" />
            </g>
          )}
          {accessory === 'fire' && (
            <g>
              <rect x="14" y="64" width="6" height="12" fill="#ED8936" opacity="0.7" />
              <rect x="15" y="60" width="4" height="8" fill="#ECC94B" opacity="0.8" />
              <rect x="80" y="64" width="6" height="12" fill="#ED8936" opacity="0.7" />
              <rect x="81" y="60" width="4" height="8" fill="#ECC94B" opacity="0.8" />
            </g>
          )}
          {accessory === 'sparkle' && (
            <g>
              <rect x="14" y="48" width="8" height="2" fill="#ECC94B" />
              <rect x="17" y="45" width="2" height="8" fill="#ECC94B" />
              <rect x="78" y="40" width="8" height="2" fill="#ECC94B" />
              <rect x="81" y="37" width="2" height="8" fill="#ECC94B" />
            </g>
          )}
        </svg>
      </div>
    );
  }

  // ── Medium / Large: full body blocky character ──
  return (
    <div className={`inline-block ${animate ? 'avatar-3d-animate' : ''} ${className}`} style={{ width: sizeConfig.width, height: sizeConfig.height }}>
      <svg viewBox="0 0 200 300" width={sizeConfig.width} height={sizeConfig.height} aria-label="Player avatar" role="img">
        <defs>
          {skin.gradient && (
            <linearGradient id="rainbow-body" x1="0" y1="0" x2="1" y2="1">
              {gradientColors.map((c, i) => (
                <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={c} />
              ))}
            </linearGradient>
          )}
        </defs>

        {/* Background aura - blocky */}
        {evo >= 2 && (
          <rect
            x={100 - 50 - evo * 10} y={160 - 70 - evo * 10}
            width={100 + evo * 20} height={140 + evo * 20}
            fill={auraColor} opacity="0.08" rx="0"
          >
            {animate && <animate attributeName="opacity" values="0.04;0.14;0.04" dur="3s" repeatCount="indefinite" />}
          </rect>
        )}

        {/* Wings for evo 4+ (level 7+) */}
        {evo >= 4 && <Wings color={auraColor} animate={animate} />}

        {/* Ascending particle trail for evo 5+ (level 15+) */}
        {evo >= 5 && (
          <g opacity="0.6">
            {[{ x: 60, d: 2.5 }, { x: 85, d: 3 }, { x: 115, d: 2.8 }, { x: 140, d: 3.2 }].map((p, i) => (
              <rect key={i} x={p.x} y={260} width={4} height={4} fill={auraColor}>
                {animate && <animateTransform attributeName="transform" type="translate" values={`0,0;0,-${80 + i * 20}`} dur={`${p.d}s`} repeatCount="indefinite" />}
                {animate && <animate attributeName="opacity" values="0.8;0" dur={`${p.d}s`} repeatCount="indefinite" />}
              </rect>
            ))}
          </g>
        )}

        {/* Crown halo for evo 6 (level 20+) */}
        {evo >= 6 && (
          <g>
            <rect x="80" y="22" width="40" height="4" fill="#F6E05E" opacity="0.6">
              {animate && <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />}
            </rect>
            <rect x="88" y="18" width="24" height="4" fill="#F6E05E" opacity="0.5" />
            <rect x="86" y="14" width="6" height="4" fill="#F6E05E" opacity="0.7" />
            <rect x="108" y="14" width="6" height="4" fill="#F6E05E" opacity="0.7" />
            <rect x="96" y="10" width="8" height="4" fill="#F6E05E" opacity="0.8" />
          </g>
        )}

        {/* Ground shadow - blocky */}
        <rect x={100 - 26 - evo * 3} y="268" width={52 + evo * 6} height="6" fill="rgba(0,0,0,0.2)" />

        {/* Character group with float animation */}
        <g>
          {animate && evo >= 3 && (
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="2.5s" repeatCount="indefinite" />
          )}

          {/* Legs - blocky rectangles */}
          <rect x="80" y="212" width="16" height="40" fill={darkColor} stroke={skin.outline} strokeWidth="1.5" />
          <rect x="104" y="212" width="16" height="40" fill={darkColor} stroke={skin.outline} strokeWidth="1.5" />
          {/* Shoes - blocky */}
          <rect x="76" y="248" width="22" height="10" fill="#4A5568" stroke="#2D3748" strokeWidth="1.5" />
          <rect x="102" y="248" width="22" height="10" fill="#4A5568" stroke="#2D3748" strokeWidth="1.5" />
          <rect x="78" y="249" width="8" height="4" fill="#718096" opacity="0.4" />
          <rect x="104" y="249" width="8" height="4" fill="#718096" opacity="0.4" />

          {/* Body - main blocky torso */}
          <rect x="70" y="136" width="60" height="78" fill={fillColor} stroke={skin.outline} strokeWidth="2" />
          {/* Body shading */}
          <rect x="70" y="136" width="20" height="30" fill="white" opacity="0.08" />
          <rect x="110" y="160" width="20" height="54" fill="black" opacity="0.06" />

          {/* Belt / waistline detail */}
          <rect x="70" y="188" width="60" height="3" fill={skin.outline} opacity="0.4" />

          {/* Outfit overlay */}
          <Outfit type={accessory} skin={skin} />

          {/* Shoulder armor for evo 3+ */}
          {evo >= 3 && <ShoulderArmor color={auraColor} />}

          {/* Arms - blocky */}
          <rect x="48" y="140" width="20" height="46" fill={fillColor} stroke={skin.outline} strokeWidth="1.5" />
          <rect x="132" y="140" width="20" height="46" fill={fillColor} stroke={skin.outline} strokeWidth="1.5" />
          {/* Arm shading */}
          <rect x="48" y="140" width="6" height="20" fill="white" opacity="0.06" />
          <rect x="146" y="155" width="6" height="20" fill="black" opacity="0.06" />
          {/* Hands - blocky squares */}
          <rect x="50" y="186" width="16" height="14" fill={lightColor} stroke={skin.outline} strokeWidth="1.5" />
          <rect x="134" y="186" width="16" height="14" fill={lightColor} stroke={skin.outline} strokeWidth="1.5" />

          {/* Head - blocky square */}
          <rect x="54" y="42" width="92" height="92" fill={fillColor} stroke={skin.outline} strokeWidth="2.5" />
          {/* Head highlight */}
          <rect x="58" y="46" width="30" height="20" fill={skin.light} opacity="0.25" />
          {/* Head shading */}
          <rect x="126" y="62" width="16" height="60" fill="black" opacity="0.06" />

          {/* Face */}
          <Eyes expression={face} cx={100} cy={84} s={1} />
          <Mouth expression={face} cx={100} cy={108} s={1} />

          {/* Glasses */}
          {accessory === 'glasses' && <Glasses cx={100} cy={84} s={1} />}

          {/* Hat */}
          {hat !== 'none' && <Hat type={hat} cx={100} baseY={46} s={1} />}

          {/* Effect accessories */}
          {accessory === 'fire' && <FireEffect animate={animate} />}
          {accessory === 'sparkle' && <SparkleEffect animate={animate} />}
          {accessory === 'lightning' && <LightningEffect animate={animate} />}
        </g>
      </svg>
    </div>
  );
}
