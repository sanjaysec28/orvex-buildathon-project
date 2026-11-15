export function ShipperWarehouseIllustration() {
  return (
    <svg
      viewBox="0 0 280 140"
      className="w-[235px] sm:w-[255px] h-auto select-none pointer-events-none"
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id="shp-wh-dome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9EDAF9" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#F6FBFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="shp-wh-roof" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5BB7F0" />
          <stop offset="100%" stopColor="#3B8CD9" />
        </linearGradient>
      </defs>

      {/* Soft sky dome backdrop */}
      <path d="M18,128 C52,18 228,18 262,128 Z" fill="url(#shp-wh-dome)" />

      {/* Ground shadow */}
      <ellipse cx="144" cy="126" rx="108" ry="6" fill="#C7E2F4" />

      {/* Greenery right */}
      <path d="M214,125 C210,111 222,102 232,108 C236,96 252,98 252,112 C258,112 260,121 254,125 Z" fill="#63B345" />
      <path d="M218,125 C216,116 226,110 233,115 C238,108 248,110 247,125 Z" fill="#8CD457" />

      {/* Warehouse main body */}
      <path d="M88,54 L154,28 L220,54 L220,124 L88,124 Z" fill="#E8F3FB" stroke="#BDD9EE" strokeWidth="1.2" />
      <path d="M154,28 L220,54 L220,124 L154,124 Z" fill="#D4E8F8" />

      {/* Pitched blue roof */}
      <path d="M78,56 L154,23 L230,56 L224,62 L154,31 L84,62 Z" fill="url(#shp-wh-roof)" />

      {/* Upper roof windows */}
      <rect x="140" y="45" width="12" height="9" rx="1.5" fill="#73CFFF" />
      <rect x="156" y="45" width="12" height="9" rx="1.5" fill="#73CFFF" />

      {/* Loading bay door */}
      <rect x="122" y="68" width="64" height="56" rx="2" fill="#18364B" />
      <line x1="122" y1="78" x2="186" y2="78" stroke="#284F6B" strokeWidth="1.5" />
      <line x1="122" y1="88" x2="186" y2="88" stroke="#284F6B" strokeWidth="1.5" />
      <rect x="128" y="92" width="52" height="32" fill="#234863" />
      <rect x="143" y="99" width="22" height="25" rx="1" fill="#F0B775" />
      <rect x="152" y="99" width="4" height="10" fill="#D48B44" />

      {/* Left awning */}
      <path d="M88,68 L118,68 L120,76 L85,76 Z" fill="#3B8CD9" />

      {/* Stacked cardboard boxes */}
      <g>
        <rect x="44" y="98" width="32" height="26" rx="2" fill="#E9AC65" stroke="#C7853D" strokeWidth="1" />
        <rect x="57" y="98" width="6" height="8" fill="#F7D09E" />
        <rect x="76" y="92" width="36" height="32" rx="2" fill="#F2BE7E" stroke="#C7853D" strokeWidth="1" />
        <rect x="91" y="92" width="6" height="10" fill="#FCE2BD" />
        <rect x="52" y="70" width="32" height="28" rx="2" fill="#F0B873" stroke="#C7853D" strokeWidth="1" />
        <rect x="65" y="70" width="6" height="8" fill="#FBE0BA" />
        <rect x="84" y="68" width="28" height="24" rx="2" fill="#DFA057" stroke="#BA7932" strokeWidth="1" />
        <rect x="95" y="68" width="6" height="7" fill="#F7D09E" />
      </g>
    </svg>
  );
}

export function RetailShopIllustration() {
  return (
    <svg
      viewBox="0 0 112 96"
      className="w-[82px] h-[72px] select-none pointer-events-none"
      aria-hidden="true"
      fill="none"
    >
      <ellipse cx="56" cy="86" rx="44" ry="5" fill="#D5E7F5" />
      {/* Store body */}
      <rect x="20" y="34" width="72" height="50" rx="3" fill="#F9FCFF" stroke="#BFD8EB" strokeWidth="1.5" />
      {/* Side wall */}
      <path d="M84,34 L92,34 L92,84 L84,84 Z" fill="#DDECF7" />
      {/* Base trim */}
      <rect x="16" y="80" width="80" height="5" rx="2" fill="#7A9CB5" />

      {/* Shop display window & door */}
      <rect x="28" y="49" width="30" height="24" rx="2" fill="#B5E3FA" stroke="#5EA9D6" strokeWidth="1.4" />
      <rect x="30" y="51" width="12" height="20" rx="1" fill="#D9F2FD" />
      <rect x="64" y="48" width="19" height="32" rx="2" fill="#2A74B8" />
      <circle cx="79" cy="65" r="1.5" fill="#C8F542" />

      {/* Striped awning */}
      <path d="M14,34 L22,16 L90,16 L98,34 Z" fill="#F2674A" />
      <path d="M26,34 L31,16 L41,16 L38,34 Z" fill="#FFFFFF" />
      <path d="M50,34 L52,16 L60,16 L62,34 Z" fill="#FFFFFF" />
      <path d="M74,34 L71,16 L81,16 L86,34 Z" fill="#FFFFFF" />

      {/* Awning scallops */}
      <path
        d="M14,34 C14,40 26,40 26,34 C26,40 38,40 38,34 C38,40 50,40 50,34 C50,40 62,40 62,34 C62,40 74,40 74,34 C74,40 86,40 86,34 C86,40 98,40 98,34"
        fill="#E05033"
      />
    </svg>
  );
}

export function IndustrialFactoryIllustration() {
  return (
    <svg
      viewBox="0 0 112 96"
      className="w-[82px] h-[72px] select-none pointer-events-none"
      aria-hidden="true"
      fill="none"
    >
      <ellipse cx="56" cy="86" rx="46" ry="5" fill="#D5E7F5" />

      {/* Smokestacks */}
      <rect x="64" y="13" width="8" height="24" rx="1.5" fill="#3B8CD9" />
      <rect x="78" y="18" width="8" height="20" rx="1.5" fill="#256FB8" />
      <path d="M68,9 C71,5 77,6 79,10" stroke="#A7D4F3" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M82,13 C86,9 92,10 94,14" stroke="#A7D4F3" strokeWidth="2" strokeLinecap="round" />

      {/* Rear factory block */}
      <rect x="52" y="34" width="42" height="50" rx="2" fill="#4BA2E3" />
      {/* Sawtooth front factory */}
      <path d="M16,44 L36,30 L36,44 L56,30 L56,84 L16,84 Z" fill="#2876C4" />
      {/* Highlight wall */}
      <rect x="56" y="42" width="38" height="42" fill="#5CB4EE" />

      {/* Factory windows */}
      <rect x="23" y="52" width="11" height="10" rx="1.5" fill="#DDF3FF" />
      <rect x="39" y="52" width="11" height="10" rx="1.5" fill="#DDF3FF" />
      <rect x="63" y="50" width="9" height="8" rx="1.5" fill="#DDF3FF" />
      <rect x="77" y="50" width="9" height="8" rx="1.5" fill="#DDF3FF" />
      <rect x="63" y="63" width="9" height="8" rx="1.5" fill="#DDF3FF" />
      <rect x="77" y="63" width="9" height="8" rx="1.5" fill="#DDF3FF" />

      {/* Warehouse roll-up door */}
      <rect x="26" y="68" width="20" height="16" rx="1.5" fill="#18364B" />
      <line x1="26" y1="73" x2="46" y2="73" stroke="#315D7D" strokeWidth="1.2" />
      <line x1="26" y1="78" x2="46" y2="78" stroke="#315D7D" strokeWidth="1.2" />
    </svg>
  );
}
