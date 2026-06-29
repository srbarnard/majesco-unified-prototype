export const layoutTokens = {
  drawerWidth: 260,
  drawerCollapsedWidth: 72,
  navRailWidth: 88,
  secondaryPanelWidth: 280,
  headerHeight: 56,
  copilotMinWidth: 320,
  copilotMaxWidth: 480,
  copilotDefaultWidth: 380,
  /** Detail panels (task details, rich side views): ~50/50 split on desktop. */
  detailPanelMinWidth: 480,
  detailPanelMinRatio: 0.4,
  detailPanelMaxRatio: 0.55,
  detailPanelDefaultRatio: 0.5,
  /** Horizontal padding for main content areas (px). */
  contentPaddingX: 25,
  /** Dashboard card corner radius (px). */
  cardRadius: 10,
  /** Subtle elevation for dashboard cards. */
  cardShadow: '0 0 4px rgba(0, 0, 0, 0.08)',
  /** Top padding for policy header and matching side panel titles. */
  policyHeaderTopPadding: { xs: 2, md: 2.5 },
  /** Space below section tab border and between list toolbar and table (theme spacing units). */
  listSectionVerticalGap: 2,
} as const
