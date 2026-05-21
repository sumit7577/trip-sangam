"use client";

/**
 * Five illustrated vehicles, each a detailed SVG side-view at 240×120 viewBox.
 * Designed to feel "editorial illustration" — clean, proportioned, with body
 * gradients, window reflections, and spinning alloy wheels.
 *
 * Each component renders the entire SVG. Wheels spin via inline CSS animation
 * (`animation: spin 0.4s linear infinite` from Tailwind's default keyframe),
 * with `transform-origin: center; transform-box: fill-box` so each wheel
 * rotates around its own local centre.
 */

const wheelSpin: React.CSSProperties = {
  transformBox: "fill-box",
  transformOrigin: "center",
  animation: "spin 0.4s linear infinite",
};

/* --------------------------------------------------------------------------
   Shared wheel — used by every vehicle so all wheels look consistent.
   -------------------------------------------------------------------------- */

function Wheel({ cx, cy, r = 16, rim = "#5A5A5A" }: { cx: number; cy: number; r?: number; rim?: string }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* Tyre */}
      <circle r={r} fill="#0F0F0F" />
      <circle r={r - 1} fill="none" stroke="#2A2A2A" strokeWidth="1" />
      {/* Tread blocks */}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={Math.cos(a) * (r - 2)}
            y1={Math.sin(a) * (r - 2)}
            x2={Math.cos(a) * r}
            y2={Math.sin(a) * r}
            stroke="#1A1A1A"
            strokeWidth="0.8"
          />
        );
      })}
      {/* Spinning alloy */}
      <g style={wheelSpin}>
        <circle r={r * 0.6} fill="#1A1A1A" stroke={rim} strokeWidth="0.8" />
        <circle r={r * 0.18} fill={rim} />
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(a) * r * 0.52;
          const y = Math.sin(a) * r * 0.52;
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke={rim}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </g>
  );
}

/* --------------------------------------------------------------------------
   Body shadow under the car — soft elliptical blur
   -------------------------------------------------------------------------- */

function Shadow({ cx, rx }: { cx: number; rx: number }) {
  return <ellipse cx={cx} cy={114} rx={rx} ry={3.5} fill="rgba(28,28,26,0.22)" />;
}

/* ===========================================================================
   1. DEFENDER — Boxy overlanding 4×4, loden green, snorkel + roof rack
   =========================================================================== */

export function Defender() {
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full">
      <defs>
        <linearGradient id="def-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3D5440" />
          <stop offset="50%" stopColor="#2C3D2E" />
          <stop offset="100%" stopColor="#1F2B20" />
        </linearGradient>
        <linearGradient id="def-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6E2E8" />
          <stop offset="100%" stopColor="#8FA3AD" />
        </linearGradient>
      </defs>

      <Shadow cx={120} rx={98} />

      {/* Roof rack */}
      <rect x="78" y="29" width="84" height="2.4" fill="#1A1A1A" />
      <rect x="78" y="26" width="2.4" height="7" fill="#1A1A1A" />
      <rect x="118" y="26" width="2.4" height="7" fill="#1A1A1A" />
      <rect x="158" y="26" width="2.4" height="7" fill="#1A1A1A" />
      {/* Cargo on rack */}
      <rect x="86" y="22" width="50" height="5" rx="1" fill="#5A4631" />
      <rect x="138" y="23" width="20" height="4" rx="0.5" fill="#3A3A3A" />

      {/* Main body */}
      <path
        d="M 22 92
           L 22 60
           Q 22 50 32 50
           L 70 50
           L 86 32
           L 168 32
           L 184 50
           L 214 50
           Q 222 50 222 60
           L 222 92 Z"
        fill="url(#def-body)"
      />
      {/* Top highlight */}
      <path
        d="M 22 60 Q 22 50 32 50 L 214 50 Q 222 50 222 60 L 222 64 L 22 64 Z"
        fill="rgba(255,255,255,0.08)"
      />

      {/* Windscreen */}
      <path d="M 75 50 L 90 35 L 124 35 L 124 50 Z" fill="url(#def-glass)" />
      {/* Rear quarter window */}
      <path d="M 128 35 L 164 35 L 178 50 L 128 50 Z" fill="url(#def-glass)" />
      {/* B-pillar */}
      <rect x="124" y="33" width="4" height="17" fill="#1F2B20" />
      {/* Window glints */}
      <path d="M 80 47 L 96 40 L 100 41 L 84 49 Z" fill="rgba(255,255,255,0.45)" />
      <path d="M 136 47 L 154 40 L 158 41 L 140 49 Z" fill="rgba(255,255,255,0.45)" />

      {/* Door line */}
      <line x1="124" y1="52" x2="124" y2="88" stroke="#1F2B20" strokeWidth="0.8" />
      {/* Door handles */}
      <rect x="100" y="68" width="6" height="1.6" rx="0.4" fill="#1A1A1A" />
      <rect x="148" y="68" width="6" height="1.6" rx="0.4" fill="#1A1A1A" />

      {/* Snorkel */}
      <path d="M 68 50 L 68 28 Q 68 25 71 25 L 74 25 L 74 50 Z" fill="#1F2B20" />

      {/* Headlight + fog light */}
      <circle cx="216" cy="64" r="4.2" fill="#FFE9B8" />
      <circle cx="216" cy="64" r="2" fill="#FFF6D9" />
      <rect x="206" y="76" width="10" height="3.5" rx="1" fill="#1A1A1A" />

      {/* Tail light */}
      <rect x="24" y="62" width="4.5" height="7" rx="1" fill="#A82138" opacity="0.85" />

      {/* Bumpers + winch */}
      <rect x="14" y="86" width="16" height="6" rx="1" fill="#1A1A1A" />
      <rect x="210" y="86" width="14" height="6" rx="1" fill="#1A1A1A" />
      <rect x="218" y="80" width="4" height="6" fill="#3F3F3F" />

      {/* Side step */}
      <rect x="40" y="92" width="160" height="2.5" fill="#1A1A1A" />

      {/* Licence plate */}
      <rect x="100" y="85" width="40" height="6" rx="1" fill="#F5EDDD" />
      <text x="120" y="90" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#1C1C1A">
        BA 2 PA 7188
      </text>

      <Wheel cx={62} cy={94} />
      <Wheel cx={186} cy={94} />
    </svg>
  );
}

/* ===========================================================================
   2. CRUISER — Modern wagon-style SUV, midnight navy, body-color trim
   =========================================================================== */

export function Cruiser() {
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full">
      <defs>
        <linearGradient id="crz-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#293B5E" />
          <stop offset="50%" stopColor="#1C2E3D" />
          <stop offset="100%" stopColor="#121E2A" />
        </linearGradient>
        <linearGradient id="crz-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B8C7D1" />
          <stop offset="100%" stopColor="#5E6F7A" />
        </linearGradient>
      </defs>

      <Shadow cx={120} rx={100} />

      {/* Roof rails */}
      <rect x="74" y="36" width="92" height="1.8" fill="#0E1620" rx="0.5" />

      {/* Body — curvier than the Defender */}
      <path
        d="M 18 92
           L 18 65
           Q 18 56 28 54
           L 60 54
           Q 65 50 70 48
           Q 75 42 82 38
           L 162 38
           Q 172 42 178 48
           Q 184 52 188 54
           L 216 54
           Q 224 56 224 65
           L 224 92 Z"
        fill="url(#crz-body)"
      />
      {/* Top sheen */}
      <path
        d="M 60 54 Q 65 50 70 48 Q 75 42 82 38 L 162 38 Q 172 42 178 48 Q 184 52 188 54 L 188 56 L 60 56 Z"
        fill="rgba(255,255,255,0.10)"
      />

      {/* Greenhouse (cabin) */}
      <path d="M 80 54 L 86 41 L 122 41 L 122 54 Z" fill="url(#crz-glass)" />
      <path d="M 124 41 L 158 41 L 174 54 L 124 54 Z" fill="url(#crz-glass)" />
      <rect x="122" y="39" width="3" height="16" fill="#0E1620" />

      {/* Window glints */}
      <path d="M 85 51 L 100 45 L 105 46 L 89 53 Z" fill="rgba(255,255,255,0.4)" />
      <path d="M 132 51 L 150 45 L 155 46 L 136 53 Z" fill="rgba(255,255,255,0.4)" />

      {/* Door cut */}
      <line x1="122" y1="56" x2="122" y2="86" stroke="#0E1620" strokeWidth="0.7" />
      <rect x="102" y="68" width="6" height="1.5" rx="0.4" fill="#0E1620" />
      <rect x="146" y="68" width="6" height="1.5" rx="0.4" fill="#0E1620" />

      {/* Side mirror */}
      <path d="M 86 50 L 76 47 L 78 52 Z" fill="#0E1620" />

      {/* Wheel arches — subtle darker accent */}
      <path d="M 46 86 Q 46 78 62 78 Q 78 78 78 86 L 78 92 L 46 92 Z" fill="rgba(0,0,0,0.18)" />
      <path d="M 170 86 Q 170 78 186 78 Q 202 78 202 86 L 202 92 L 170 92 Z" fill="rgba(0,0,0,0.18)" />

      {/* LED-strip headlight */}
      <rect x="208" y="60" width="14" height="2.5" rx="1" fill="#FFF6D9" />
      <circle cx="216" cy="68" r="3.5" fill="#FFE9B8" />
      <rect x="206" y="78" width="14" height="3" rx="0.8" fill="#0E1620" />

      {/* Tail lights */}
      <rect x="20" y="60" width="6" height="3" rx="0.6" fill="#A82138" opacity="0.85" />
      <rect x="20" y="65" width="6" height="2" rx="0.5" fill="#A82138" opacity="0.5" />

      {/* Bumpers (body-color) */}
      <rect x="14" y="86" width="14" height="6" rx="1" fill="#121E2A" />
      <rect x="212" y="86" width="14" height="6" rx="1" fill="#121E2A" />

      {/* Plate */}
      <rect x="100" y="84" width="40" height="6" rx="1" fill="#F5EDDD" />
      <text x="120" y="89" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#1C1C1A">
        BA 1 CHA 4021
      </text>

      <Wheel cx={62} cy={94} rim="#7A7A7A" />
      <Wheel cx={186} cy={94} rim="#7A7A7A" />
    </svg>
  );
}

/* ===========================================================================
   3. PICKUP — Double-cab truck with cargo bed + bed roll-bar, copper
   =========================================================================== */

export function Pickup() {
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full">
      <defs>
        <linearGradient id="pck-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A66B45" />
          <stop offset="50%" stopColor="#7E4D2E" />
          <stop offset="100%" stopColor="#5A371F" />
        </linearGradient>
        <linearGradient id="pck-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8E0E5" />
          <stop offset="100%" stopColor="#8A969E" />
        </linearGradient>
      </defs>

      <Shadow cx={122} rx={100} />

      {/* Bed roll-bar (behind cabin) */}
      <path d="M 92 54 Q 92 32 102 32 L 110 32" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 110 32 L 122 32" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Roof of cab continues to back rollbar */}
      <line x1="92" y1="54" x2="92" y2="68" stroke="#1A1A1A" strokeWidth="2" />

      {/* Cargo bed (right side) + cabin (left side) shape */}
      <path
        d="M 22 92
           L 22 64
           Q 22 56 30 56
           L 60 56
           L 76 40
           L 138 40
           L 138 56
           L 200 56
           Q 218 56 222 70
           L 222 92 Z"
        fill="url(#pck-body)"
      />

      {/* Cargo bed depression */}
      <path d="M 142 56 L 200 56 Q 214 56 218 66 L 218 88 L 142 88 Z" fill="rgba(0,0,0,0.18)" />
      {/* Cargo: tarp-covered luggage */}
      <path d="M 150 58 Q 170 50 200 58 L 200 78 L 150 78 Z" fill="#3F3F3F" />
      <path d="M 152 60 L 198 60" stroke="#5A4631" strokeWidth="0.8" />
      <path d="M 152 66 L 198 66" stroke="#5A4631" strokeWidth="0.8" />

      {/* Windscreen + side window */}
      <path d="M 65 56 L 78 42 L 112 42 L 112 56 Z" fill="url(#pck-glass)" />
      <path d="M 114 42 L 134 42 L 138 56 L 114 56 Z" fill="url(#pck-glass)" />
      <rect x="112" y="40" width="3" height="16" fill="#5A371F" />
      <path d="M 70 53 L 86 46 L 92 47 L 74 55 Z" fill="rgba(255,255,255,0.4)" />

      {/* Door cut + handle */}
      <line x1="100" y1="58" x2="100" y2="86" stroke="#5A371F" strokeWidth="0.7" />
      <rect x="84" y="68" width="6" height="1.6" rx="0.4" fill="#3F2A19" />

      {/* Headlight */}
      <circle cx="32" cy="68" r="3.8" fill="#FFE9B8" />
      <circle cx="32" cy="68" r="1.8" fill="#FFF6D9" />

      {/* Tail-light at far right (back of truck) — but wait, truck faces left
          when we use scaleX(-1). Tail light on left side of SVG (which becomes
          right after flip) is the BACK of the truck. */}
      {/* Bumpers */}
      <rect x="16" y="86" width="14" height="6" rx="1" fill="#1A1A1A" />
      <rect x="212" y="86" width="14" height="6" rx="1" fill="#1A1A1A" />

      {/* Side step under cab */}
      <rect x="40" y="92" width="60" height="2.5" fill="#1A1A1A" />

      {/* Plate */}
      <rect x="50" y="84" width="36" height="6" rx="1" fill="#F5EDDD" />
      <text x="68" y="89" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#1C1C1A">
        GA 2 LU 0814
      </text>

      <Wheel cx={62} cy={94} />
      <Wheel cx={188} cy={94} />
    </svg>
  );
}

/* ===========================================================================
   4. ADVENTURE VAN — Long-wheelbase camper-style van, champagne, roof box
   =========================================================================== */

export function AdventureVan() {
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full">
      <defs>
        <linearGradient id="van-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0C99E" />
          <stop offset="60%" stopColor="#C9A876" />
          <stop offset="100%" stopColor="#9B8868" />
        </linearGradient>
        <linearGradient id="van-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C5D6DC" />
          <stop offset="100%" stopColor="#7A8A92" />
        </linearGradient>
      </defs>

      <Shadow cx={120} rx={106} />

      {/* Roof box */}
      <path d="M 70 30 Q 70 26 74 26 L 156 26 Q 160 26 160 30 L 160 36 L 70 36 Z" fill="#4E4E4E" />
      <line x1="78" y1="30" x2="152" y2="30" stroke="#2F2F2F" strokeWidth="0.5" />

      {/* Body — tall and long */}
      <path
        d="M 12 92
           L 12 60
           Q 12 50 22 48
           L 68 38
           L 168 38
           Q 200 40 220 50
           Q 228 54 228 64
           L 228 92 Z"
        fill="url(#van-body)"
      />
      {/* Top highlight strip */}
      <path
        d="M 68 38 L 168 38 L 168 42 L 68 42 Z"
        fill="rgba(255,255,255,0.18)"
      />

      {/* Multiple side windows */}
      <path d="M 72 42 L 100 42 L 100 60 L 72 60 Z" fill="url(#van-glass)" />
      <rect x="102" y="42" width="2" height="18" fill="#8E7A56" />
      <path d="M 104 42 L 130 42 L 130 60 L 104 60 Z" fill="url(#van-glass)" />
      <rect x="132" y="42" width="2" height="18" fill="#8E7A56" />
      <path d="M 134 42 L 162 42 L 162 60 L 134 60 Z" fill="url(#van-glass)" />

      {/* Windscreen — angled at right end */}
      <path d="M 164 42 L 196 50 L 196 60 L 164 60 Z" fill="url(#van-glass)" />

      {/* Window reflections */}
      <path d="M 76 58 L 96 48 L 100 48 L 80 60 Z" fill="rgba(255,255,255,0.35)" />
      <path d="M 108 58 L 126 48 L 130 48 L 112 60 Z" fill="rgba(255,255,255,0.35)" />
      <path d="M 138 58 L 158 48 L 162 48 L 142 60 Z" fill="rgba(255,255,255,0.35)" />

      {/* Sliding door cut */}
      <line x1="102" y1="62" x2="102" y2="88" stroke="#8E7A56" strokeWidth="0.7" />
      <line x1="134" y1="62" x2="134" y2="88" stroke="#8E7A56" strokeWidth="0.7" />
      <rect x="110" y="72" width="8" height="1.6" rx="0.4" fill="#5A4631" />

      {/* Belt-line trim */}
      <line x1="20" y1="64" x2="220" y2="64" stroke="#8E7A56" strokeWidth="0.6" opacity="0.6" />

      {/* Headlight */}
      <circle cx="216" cy="70" r="3.8" fill="#FFE9B8" />
      <rect x="208" y="78" width="14" height="2.5" rx="0.5" fill="#5A4631" />

      {/* Tail lights */}
      <rect x="14" y="64" width="6" height="4" rx="0.6" fill="#A82138" opacity="0.85" />

      {/* Bumpers */}
      <rect x="10" y="86" width="16" height="6" rx="1" fill="#4E4E4E" />
      <rect x="214" y="86" width="16" height="6" rx="1" fill="#4E4E4E" />

      {/* Side step */}
      <rect x="30" y="92" width="180" height="2.5" fill="#4E4E4E" />

      {/* Plate */}
      <rect x="100" y="82" width="40" height="6" rx="1" fill="#F5EDDD" />
      <text x="120" y="87" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#1C1C1A">
        BA 3 JA 5611
      </text>

      <Wheel cx={56} cy={94} />
      <Wheel cx={184} cy={94} />
    </svg>
  );
}

/* ===========================================================================
   5. THAR — Short-wheelbase open-top jeep, charcoal, round headlights
   =========================================================================== */

export function Thar() {
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full">
      <defs>
        <linearGradient id="thar-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#42423F" />
          <stop offset="50%" stopColor="#2A2A28" />
          <stop offset="100%" stopColor="#161614" />
        </linearGradient>
      </defs>

      <Shadow cx={122} rx={88} />

      {/* Roll cage */}
      <path
        d="M 80 56 Q 80 30 92 30 L 168 30 Q 180 30 180 56"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1="130" y1="30" x2="130" y2="56" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="80" y1="42" x2="180" y2="42" stroke="#1A1A1A" strokeWidth="1.5" opacity="0.7" />

      {/* Body — short, stubby jeep */}
      <path
        d="M 38 92
           L 38 62
           Q 38 54 46 54
           L 80 54
           L 80 50
           L 180 50
           L 180 54
           L 198 54
           Q 208 54 208 62
           L 208 92 Z"
        fill="url(#thar-body)"
      />
      {/* Top trim highlight */}
      <path d="M 38 62 Q 38 54 46 54 L 198 54 Q 208 54 208 62 L 208 65 L 38 65 Z" fill="rgba(255,255,255,0.08)" />

      {/* Windscreen (flat, vertical) */}
      <rect x="170" y="38" width="3" height="16" fill="#1A1A1A" />
      <path d="M 173 38 L 198 50 L 198 54 L 173 54 Z" fill="#C5D6DC" opacity="0.8" />
      <path d="M 174 50 L 196 50 L 198 53 L 174 53 Z" fill="rgba(255,255,255,0.45)" />

      {/* Door cut + handle */}
      <line x1="120" y1="56" x2="120" y2="88" stroke="#1A1A1A" strokeWidth="0.8" />
      <rect x="98" y="68" width="6" height="1.6" rx="0.4" fill="#0F0F0F" />

      {/* Twin round headlights */}
      <circle cx="200" cy="68" r="4" fill="#1A1A1A" />
      <circle cx="200" cy="68" r="3" fill="#FFE9B8" />
      <circle cx="200" cy="68" r="1.4" fill="#FFF6D9" />

      {/* Grille slats */}
      <rect x="195" y="74" width="14" height="6" fill="#0F0F0F" />
      <line x1="196" y1="76" x2="208" y2="76" stroke="#3A3A3A" strokeWidth="0.5" />
      <line x1="196" y1="78" x2="208" y2="78" stroke="#3A3A3A" strokeWidth="0.5" />

      {/* Spare tire mounted on the back (left side of SVG) */}
      <g transform="translate(34, 70)">
        <circle r="9" fill="#0F0F0F" />
        <circle r="7" fill="none" stroke="#2A2A2A" strokeWidth="0.8" />
        <circle r="4" fill="#1A1A1A" />
      </g>

      {/* Bumpers */}
      <rect x="28" y="86" width="14" height="6" rx="1" fill="#1A1A1A" />
      <rect x="198" y="86" width="16" height="6" rx="1" fill="#1A1A1A" />
      <rect x="208" y="80" width="4" height="6" fill="#3F3F3F" />

      {/* Side step */}
      <rect x="50" y="92" width="140" height="2.5" fill="#1A1A1A" />

      {/* Plate */}
      <rect x="100" y="83" width="40" height="6" rx="1" fill="#F5EDDD" />
      <text x="120" y="88" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#1C1C1A">
        BA 4 THA 0905
      </text>

      <Wheel cx={70} cy={94} r={17} />
      <Wheel cx={176} cy={94} r={17} />
    </svg>
  );
}
