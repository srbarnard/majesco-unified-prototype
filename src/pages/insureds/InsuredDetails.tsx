import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router'
import { Card } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import {
  resolveOverviewCopilotPanel,
  useCloseCopilotWhenMobile,
  useDesktopCopilotInitialOpen,
} from '@/pages/policies/hooks/useResponsiveCopilotPanel'
import {
  InsuredHeader,
  type InsuredRightPanel,
} from '@/pages/insureds/components/InsuredHeader'
import { InsuredContactsPanel } from '@/pages/insureds/components/InsuredContactsPanel'
import { InsuredOverviewTab } from '@/pages/insureds/components/InsuredOverviewTab'
import type { InsuredTab } from '@/pages/insureds/components/InsuredTabs'
import {
  getInsuredOverviewStats,
  getInsuredRecentActivity,
  resolveInsuredContext,
} from '@/pages/insureds/data/resolveInsuredContext'

export function InsuredDetails() {
  const { insuredId } = useParams<{ insuredId: string }>()
  const insured = resolveInsuredContext(insuredId)
  const isDesktop = useIsDesktopLayout()
  const [activeTab, setActiveTab] = useState<InsuredTab>('overview')
  const [starred, setStarred] = useState(false)
  const [activeRightPanel, setActiveRightPanel] = useState<InsuredRightPanel | null>(null)

  useDesktopCopilotInitialOpen(isDesktop, activeTab === 'overview', 'copilot', setActiveRightPanel)
  useCloseCopilotWhenMobile(isDesktop, activeRightPanel, 'copilot', setActiveRightPanel)

  const handleToggleRightPanel = useCallback((panel: InsuredRightPanel) => {
    setActiveRightPanel((current) => (current === panel ? null : panel))
  }, [])

  const handleCloseRightPanel = useCallback(() => {
    setActiveRightPanel(null)
  }, [])

  const handleTabChange = useCallback((tab: InsuredTab) => {
    setActiveTab(tab)
    if (tab === 'overview') {
      setActiveRightPanel((current) => resolveOverviewCopilotPanel(isDesktop, current, 'copilot', 'contacts'))
    }
  }, [isDesktop])

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <InsuredHeader
            insured={insured}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            activeRightPanel={activeRightPanel}
            onToggleRightPanel={handleToggleRightPanel}
            starred={starred}
            onToggleStar={() => setStarred((prev) => !prev)}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            px: `${layoutTokens.contentPaddingX}px`,
            py: `${layoutTokens.contentPaddingX}px`,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {activeTab === 'overview' && (
            <InsuredOverviewTab
              insured={insured}
              stats={getInsuredOverviewStats(insured)}
              recentActivity={getInsuredRecentActivity(insured)}
            />
          )}
          {activeTab === 'policies' && (
            <Card title="Policies">
              <Typography variant="body2" color="text.secondary">
                In-force and historical policies for {insured.name} will appear here.
              </Typography>
            </Card>
          )}
          {activeTab === 'claims' && (
            <Card title="Claims">
              <Typography variant="body2" color="text.secondary">
                Open and closed claims linked to this insured will appear here.
              </Typography>
            </Card>
          )}
          {activeTab === 'documents' && (
            <Card title="Documents">
              <Typography variant="body2" color="text.secondary">
                Account-level documents and correspondence will appear here.
              </Typography>
            </Card>
          )}
          {activeTab === 'activity' && (
            <Card title="Activity">
              <Typography variant="body2" color="text.secondary">
                Full activity timeline for {insured.name} will appear here.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={activeRightPanel !== null} onClose={handleCloseRightPanel}>
        {activeRightPanel === 'contacts' && (
          <InsuredContactsPanel contacts={insured.contacts} onClose={handleCloseRightPanel} />
        )}
        {activeRightPanel === 'copilot' && (
          <CopilotPanel context="insured" focusedInsured={insured} onClose={handleCloseRightPanel} />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default InsuredDetails
