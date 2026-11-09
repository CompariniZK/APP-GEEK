import type { FranchiseId } from '@/lib/types';

/**
 * Original illustrations for the game cards on the home screen, drawn for RadarGeek.
 * They only evoke each universe with generic motifs (a lightning bolt, fanned cards,
 * a compass, an energy burst, a pixel egg) — no characters, logos or official artwork.
 * Every card shares the same radar rings in the background.
 *
 * ViewBox is 100 × 136 (the card's inner frame). The motif stays between y = 34 and y = 92
 * so it never sits under the abbreviation (top) or the game's name (bottom).
 */
const W = 100;
const H = 136;
const CX = 50;
const CY = 63;
const INK = '#16140F';

function starPoints(cx: number, cy: number, outer: number, points: number, innerRatio: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : outer * innerRatio;
    const a = (Math.PI / points) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Four-point twinkle. */
function sparkle(cx: number, cy: number, r: number, fill = '#FFFFFF', stroke = INK): string {
  return `<path d="M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
}

/** The radar rings shared by every card. */
function rings(color: string): string {
  return [22, 36, 50]
    .map((r) => `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"/>`)
    .join('');
}

function svg(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

// Electric: a bold lightning bolt with sparks and speed lines.
const electric = svg(
  rings('#C99400') +
    `<path d="M74 66 L86 62 M76 74 L90 72 M12 58 L24 56" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` +
    `<path d="M56 36 L37 68 L50 68 L44 92 L69 58 L56 58 L66 36 Z" fill="#FFF4CC" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    sparkle(24, 44, 7) +
    sparkle(78, 84, 6) +
    sparkle(24, 86, 4.5) +
    sparkle(80, 42, 4.5),
);

// Duel: three cards fanned out, a star on the front one.
const fannedCard = (angle: number, fill: string, stroke: string, inner: string) =>
  `<g transform="rotate(${angle} 50 104)"><rect x="35" y="40" width="30" height="42" rx="3.5" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>${inner}</g>`;
const cardBack = `<ellipse cx="50" cy="61" rx="8" ry="11" fill="none" stroke="#9C86E0" stroke-width="2"/>`;
const cardFront =
  `<rect x="39" y="45" width="22" height="18" rx="2" fill="#B9A6F0"/>` +
  `<polygon points="${starPoints(50, 54.5, 7, 5, 0.45)}" fill="#FFD54A" stroke="#1E1240" stroke-width="1.5" stroke-linejoin="round"/>` +
  `<rect x="39" y="67" width="22" height="3" rx="1.5" fill="#B9A6F0"/>` +
  `<rect x="39" y="73" width="15" height="3" rx="1.5" fill="#B9A6F0"/>`;
const duel = svg(
  rings('#7A5FCB') +
    fannedCard(-22, '#3E2A80', '#E9E3F6', cardBack) +
    fannedCard(22, '#3E2A80', '#E9E3F6', cardBack) +
    fannedCard(0, '#F3EEFF', '#1E1240', cardFront) +
    sparkle(20, 42, 5, '#FFFFFF', '#1E1240') +
    sparkle(82, 46, 6, '#FFFFFF', '#1E1240') +
    sparkle(80, 86, 4, '#FFFFFF', '#1E1240'),
);

// Sea voyage: a compass rose, seagulls and waves.
const voyage = svg(
  rings('#4A8FCC') +
    `<path d="M70 40 Q74 36 78 40 Q82 36 86 40" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M14 46 Q17 43 20 46 Q23 43 26 46" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>` +
    `<circle cx="50" cy="63" r="26" fill="#E8F1FA" stroke="#0B355C" stroke-width="2.5"/>` +
    `<circle cx="50" cy="63" r="20" fill="none" stroke="#9CC3E6" stroke-width="1.5"/>` +
    `<g transform="rotate(45 50 63)"><polygon points="50,46 53,63 50,80 47,63" fill="#9CC3E6"/></g>` +
    `<polygon points="27,63 50,58 73,63 50,68" fill="#3F86C6"/>` +
    `<polygon points="50,40 55,63 50,86 45,63" fill="#0B355C"/>` +
    `<circle cx="50" cy="63" r="3.5" fill="#FFFFFF" stroke="#0B355C" stroke-width="1.5"/>` +
    `<path d="M2 84 Q8 79 14 84 T26 84 M74 84 Q80 79 86 84 T98 84" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>` +
    `<path d="M6 91 Q12 86 18 91 T30 91 M70 91 Q76 86 82 91 T94 91" fill="none" stroke="#9CC3E6" stroke-width="2.5" stroke-linecap="round"/>`,
);

// Energy: a spiky power burst with flying debris.
// Side-only rays so nothing reaches the abbreviation (top) or the two-line name (bottom).
const burstLines = [20, 340, 160, 200, 60, 120]
  .map((deg) => {
    const a = (deg * Math.PI) / 180;
    const x1 = (CX + 31 * Math.cos(a)).toFixed(1);
    const y1 = (CY - 2 + 31 * Math.sin(a)).toFixed(1);
    const x2 = (CX + 38 * Math.cos(a)).toFixed(1);
    const y2 = (CY - 2 + 38 * Math.sin(a)).toFixed(1);
    return `M${x1} ${y1} L${x2} ${y2}`;
  })
  .join(' ');
const energy = svg(
  rings('#D9650A') +
    `<path d="${burstLines}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<polygon points="${starPoints(CX, CY - 2, 26, 12, 0.62)}" fill="#FFD27A" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<circle cx="${CX}" cy="${CY - 2}" r="11" fill="#FFF6E0" stroke="${INK}" stroke-width="2.5"/>` +
    `<circle cx="${CX}" cy="${CY - 2}" r="5" fill="#FFFFFF"/>` +
    `<polygon points="12,80 18,76 21,82 15,85" fill="#8A4A12" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<polygon points="80,78 86,74 88,80 82,83" fill="#8A4A12" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<polygon points="18,40 23,37 25,42 20,44" fill="#8A4A12" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`,
);

// Digital: a pixel-spotted egg about to hatch, wired to circuit traces.
const digital = svg(
  rings('#2FA6A6') +
    `<path d="M73 56 H86 V44 M27 76 H14 V88 M72 82 H84" fill="none" stroke="#BFECEC" stroke-width="2"/>` +
    `<circle cx="86" cy="44" r="2.5" fill="#FFFFFF"/><circle cx="14" cy="88" r="2.5" fill="#FFFFFF"/><circle cx="84" cy="82" r="2.5" fill="#FFFFFF"/>` +
    `<path d="M50 34 C64 34 73 54 73 68 C73 82 63 92 50 92 C37 92 27 82 27 68 C27 54 36 34 50 34 Z" fill="#E2F5F5" stroke="#073D3D" stroke-width="2.5"/>` +
    `<g fill="#138A8A"><rect x="41" y="46" width="6" height="6" rx="1"/><rect x="55" y="50" width="6" height="6" rx="1"/><rect x="35" y="57" width="6" height="6" rx="1"/><rect x="59" y="60" width="5" height="5" rx="1"/><rect x="44" y="78" width="6" height="6" rx="1"/><rect x="56" y="77" width="5" height="5" rx="1"/></g>` +
    `<polyline points="28,70 35,65 42,71 49,64 56,71 63,65 72,70" fill="none" stroke="#073D3D" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` +
    sparkle(82, 36, 4, '#FFFFFF', '#073D3D') +
    sparkle(18, 46, 3.5, '#FFFFFF', '#073D3D'),
);

export const FRANCHISE_ART: Record<FranchiseId, string> = {
  pokemon: electric,
  yugioh: duel,
  onepiece: voyage,
  dbs: energy,
  digimon: digital,
};
