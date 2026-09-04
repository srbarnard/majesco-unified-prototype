import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolParties,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { Card } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { InsuredHeader } from '@/pages/insureds/components/InsuredHeader'
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
  const { openTool, closeTool, activeTool } = useRightTool()
  const [activeTab, setActiveTab] = useState<InsuredTab>('overview')
  const [starred, setStarred] = useState(false)
  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  useRegisterRightToolRecordContext(
    { title: insured.name, subtitle: insured.status },
    [insured.name, insured.status],
  )

  useRegisterRightToolCopilot(
    {
      context: 'insured',
      focusedInsured: insured,
    },
    [insured],
  )

  useRegisterRightToolParties(
    <InsuredContactsPanel contacts={insured.contacts} onClose={closeTool} />,
    [insured.contacts, closeTool],
  )

  useEffect(() => {
    if (didInitCopilot.current) return
    didInitCopilot.current = true
    if (isDesktop && activeTab === 'overview') {
      openTool('copilot')
    }
  }, [activeTab, isDesktop, openTool])

  useEffect(() => {
    if (wasDesktop.current && !isDesktop && activeTool === 'copilot') {
      closeTool()
    }
    wasDesktop.current = isDesktop
  }, [activeTool, closeTool, isDesktop])

  const syncTabPanels = useCallback(
    (tab: InsuredTab) => {
      if (tab === 'overview') {
        if (activeTool === 'parties' || activeTool === 'filter') return
        if (isDesktop) openTool('copilot')
        return
      }
      closeTool()
    },
    [activeTool, closeTool, isDesktop, openTool],
  )

  const handleTabChange = useCallback(
    (tab: InsuredTab) => {
      setActiveTab(tab)
      syncTabPanels(tab)
    },
    [syncTabPanels],
  )

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
    </Box>
  )
}

export default InsuredDetails
