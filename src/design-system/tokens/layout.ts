export const layoutTokens = {
  drawerWidth: 260,
  drawerCollapsedWidth: 72,
  navRailWidth: 88,
  secondaryPanelWidth: 280,
  headerHeight: 56,
  /** @deprecated Prefer detailPanel* — Copilot now shares the detail-panel width. */
  copilotMinWidth: 360,
  copilotMaxWidth: 720,
  copilotDefaultWidth: 420,
  /** Right drawer (Copilot + task/activity): ~2/3 content · 1/3 drawer; user can drag. */
  detailPanelMinWidth: 360,
  detailPanelMinRatio: 0.28,
  detailPanelMaxRatio: 0.55,
  detailPanelDefaultRatio: 0.34,
  detailPanelFallbackWidth: 420,
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
