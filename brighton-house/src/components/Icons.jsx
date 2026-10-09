const P = {
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l3 3M14 9l2 2" /></>,
  train: <><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 11h14M9 21l2-4M15 21l-2-4M9 14h.01M15 14h.01" /></>,
  building: <path d="M4 21V7l8-4 8 4v14M2 21h20M9 21v-5h6v5M9 10h2M13 10h2M9 13h2M13 13h2" />,
  tag: <><path d="M3 12V4h8l10 10-8 8L3 12z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  chip: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  sunrise: <path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 5v3M5 10l1.5 1.5M19 10l-1.5 1.5" />,
  sunset: <path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 9v-3M5.5 12l-1-1M18.5 12l1-1M9 4l3 3 3-3" />,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  leaf: <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c3-5 6-8 11-11" />,
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 0 2 2h13M9 7h6" />,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3 3 0 0 1 0 5.6M18 14.3c2 .8 3.5 2.8 3.5 5.7" /></>,
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4M9 9.5h.01M15 9.5h.01" /></>,
  bench: <path d="M4 11h16M5 11V8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M6 11v6M18 11v6M4 17h16" />,
  shield: <><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 5-5" /></>,
  plug: <path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7zM12 17v5" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  whatsapp: <><path d="M3 21l1.6-4.6A9 9 0 1 1 8 19.6L3 21z" /><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2L9 8.5z" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  pin: <><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  road: <path d="M8 3L5 21M16 3l3 18M12 4v3M12 10v4M12 17v3" />,
  plane: <path d="M3 11l18-8-8 18-2-8-8-2z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  home: <path d="M4 11l8-7 8 7M6 10v10h12V10" />,
  cube: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
};

export function Icon({ name, size = 24, className = '', strokeWidth = 1.7 }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {P[name]}
    </svg>
  );
}

// Brighton House mark: a sun rising behind a six-level (G+5) block
export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="10" fill="var(--blue)" />
      <circle cx="26" cy="14" r="6" fill="var(--sun)" />
      <g fill="#fff">
        <rect x="9" y="17" width="16" height="3.2" rx=".8" />
        <rect x="9" y="21.2" width="16" height="3.2" rx=".8" />
        <rect x="9" y="25.4" width="16" height="3.2" rx=".8" />
        <rect x="9" y="29.6" width="16" height="3.2" rx=".8" opacity=".55" />
      </g>
    </svg>
  );
}
