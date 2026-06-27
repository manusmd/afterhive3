export const afterhivePalette = {
  light: {
    primary: {
      main: "#CA8A04",
      light: "#EAB308",
      dark: "#A16207",
      contrastText: "#0D0D0D",
    },
    secondary: { main: "#64748B" },
    error: { main: "#DC2626" },
    warning: { main: "#CA8A04" },
    info: { main: "#2563EB" },
    success: { main: "#16A34A" },
    background: {
      default: "#F4F4F5",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#18181B",
      secondary: "#71717A",
    },
    divider: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    primary: {
      main: "#F5C518",
      light: "#FDE047",
      dark: "#EAB308",
      contrastText: "#0D0D0D",
    },
    secondary: { main: "#A1A1AA" },
    error: { main: "#EF4444" },
    warning: { main: "#F5C518" },
    info: { main: "#3B82F6" },
    success: { main: "#22C55E" },
    background: {
      default: "#0D0D0D",
      paper: "#1A1A1A",
    },
    text: {
      primary: "#FAFAFA",
      secondary: "#A1A1AA",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
} as const;

export const afterhiveShell = {
  dark: {
    sidebar: "#141414",
    sidebarBorder: "rgba(255, 255, 255, 0.06)",
    topbar: "#0D0D0D",
    searchBackground: "#1A1A1A",
    searchBorder: "rgba(255, 255, 255, 0.08)",
    navSectionLabel: "#71717A",
    navActiveBackground: "rgba(245, 197, 24, 0.12)",
    navActiveText: "#F5C518",
    secondaryButtonBackground: "#2A2A2A",
    secondaryButtonBorder: "rgba(255, 255, 255, 0.08)",
    cardBorder: "rgba(255, 255, 255, 0.06)",
  },
  light: {
    sidebar: "#FFFFFF",
    sidebarBorder: "rgba(0, 0, 0, 0.08)",
    topbar: "#F4F4F5",
    searchBackground: "#FFFFFF",
    searchBorder: "rgba(0, 0, 0, 0.08)",
    navSectionLabel: "#71717A",
    navActiveBackground: "rgba(202, 138, 4, 0.12)",
    navActiveText: "#A16207",
    secondaryButtonBackground: "#F4F4F5",
    secondaryButtonBorder: "rgba(0, 0, 0, 0.08)",
    cardBorder: "rgba(0, 0, 0, 0.08)",
  },
} as const;

export const afterhiveTypography = {
  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  h1: { fontSize: "2rem", fontWeight: 600, lineHeight: 1.2 },
  h2: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.35 },
  h4: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
  body1: { fontSize: "0.875rem", lineHeight: 1.5 },
  body2: { fontSize: "0.8125rem", lineHeight: 1.5 },
  overline: {
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    lineHeight: 1.6,
    textTransform: "uppercase" as const,
  },
  button: { textTransform: "none" as const, fontWeight: 600 },
};

export const afterhiveShape = {
  borderRadius: 8,
  cardRadius: 12,
  chipRadius: 6,
  buttonRadius: 8,
  searchRadius: 10,
};

export const afterhiveLayout = {
  drawerWidth: 280,
  topbarHeight: 64,
  contentPadding: 24,
  cardPadding: 20,
  navItemHeight: 40,
};

export const afterhiveShadows = {
  cardDark: "0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px rgba(0, 0, 0, 0.35)",
  cardLight: "0 1px 2px rgba(0, 0, 0, 0.06)",
};
