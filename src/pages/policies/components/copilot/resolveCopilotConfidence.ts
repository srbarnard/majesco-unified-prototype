import type { GlobalCopilotView } from '@/app/contexts/GlobalSearchContext'
import type { PolicyTab } from '@/pages/policies/components/PolicyTabs'
import {
  DEFAULT_COPILOT_CONFIDENCE_TIERS,
  getCopilotConfidenceStatusLabel,
  type CopilotConfidenceModel,
} from '@/pages/policies/components/copilot/copilotConfidence'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import type { QuoteDetailsRecord } from '@/pages/quotes/data/mockQuoteDetails'
import type { Quote, QuoteStatus } from '@/pages/quotes/data/mockQuotes'

type ResolveCopilotConfidenceInput = {
  context?: 'policy' | 'quotes' | 'quote-detail' | 'submission-detail' | 'insured' | 'insureds' | 'policies-list' | 'tasks' | 'customers' | 'global'
  activePolicyTab?: PolicyTab
  globalView?: GlobalCopilotView
  agenticPrompt?: string | null
  documentPreviewMode?: boolean
  documentsCopilotMode?: 'workspace' | 'impact'
  focusedDocument?: PolicyDocument | null
  focusedQuote?: Quote | null
  focusedQuoteDetail?: QuoteDetailsRecord | null
  isAttachView?: boolean
  isTaskRecommendationView?: boolean
}

function quoteStatusConfidence(status: QuoteStatus) {
  switch (status) {
    case 'Issued':
      return 94
    case 'Ready for booking':
    case 'Pending issuance':
      return 90
    case 'Quoted':
      return 88
    case 'Presented':
      return 82
    case 'Setup in progress':
      return 58
    case 'Referred':
    case 'Pending pricing approval':
      return 48
    case 'Draft':
      return 38
    case 'Rating blocked':
      return 18
    default:
      return 52
  }
}

function policyTabConfidence(tab: PolicyTab) {
  switch (tab) {
    case 'overview':
      return 76
    case 'documents':
      return 71
    case 'analytics':
      return 68
    default:
      return 74
  }
}

export function resolveCopilotConfidence(input: ResolveCopilotConfidenceInput): CopilotConfidenceModel | null {
  const {
    context = 'policy',
    activePolicyTab = 'overview',
    globalView = null,
    agenticPrompt = null,
    documentPreviewMode = false,
    documentsCopilotMode = 'workspace',
    focusedDocument,
    focusedQuote,
    focusedQuoteDetail,
    isAttachView = false,
    isTaskRecommendationView = false,
  } = input

  if (isAttachView || isTaskRecommendationView) return null
  if (context === 'global' || globalView === 'agentic-search' || globalView === 'daily-summary' || agenticPrompt) {
    return null
  }
  if (context === 'insured' || context === 'insureds' || context === 'policies-list' || context === 'tasks' || context === 'customers') {
    return null
  }
  if (context === 'quotes' && !focusedQuote) {
    return null
  }

  if (documentPreviewMode && focusedDocument) {
    const confidence = 79
    return {
      confidence,
      statusLabel: getCopilotConfidenceStatusLabel(confidence),
      popoverTitle: 'Extraction confidence',
      popoverDescription:
        'How reliably the assistant extracted structured data from this document for use in the submission or policy record.',
      tiers: DEFAULT_COPILOT_CONFIDENCE_TIERS,
    }
  }

  if (context === 'policy' && activePolicyTab === 'documents' && documentsCopilotMode === 'impact') {
    const confidence = 67
    return {
      confidence,
      statusLabel: 'Analyzing impact',
      popoverTitle: 'Refinement confidence',
      popoverDescription:
        'Confidence that the assistant has enough context to assess how document changes affect the policy.',
      tiers: DEFAULT_COPILOT_CONFIDENCE_TIERS,
    }
  }

  if (context === 'quote-detail' && focusedQuoteDetail) {
    const confidence = quoteStatusConfidence(focusedQuoteDetail.status)
    return {
      confidence,
      statusLabel: getCopilotConfidenceStatusLabel(confidence),
      popoverTitle: 'Submission confidence',
      popoverDescription:
        'How complete and consistent this quote submission is based on rating inputs, documents, and open items.',
      tiers: DEFAULT_COPILOT_CONFIDENCE_TIERS,
    }
  }

  if (focusedQuote) {
    const confidence = quoteStatusConfidence(focusedQuote.status)
    return {
      confidence,
      statusLabel: getCopilotConfidenceStatusLabel(confidence),
      popoverTitle: 'Submission confidence',
      popoverDescription:
        'How complete and consistent this quote submission is based on captured details and underwriting status.',
      tiers: DEFAULT_COPILOT_CONFIDENCE_TIERS,
    }
  }

  if (
    context === 'policy' &&
    activePolicyTab === 'documents' &&
    !documentPreviewMode &&
    documentsCopilotMode !== 'impact'
  ) {
    return null
  }

  if (context === 'policy') {
    const confidence = policyTabConfidence(activePolicyTab)
    return {
      confidence,
      statusLabel: getCopilotConfidenceStatusLabel(confidence),
      popoverTitle: 'Refinement confidence',
      popoverDescription:
        'How complete the policy context is for assisted refinement, endorsements, and renewal work.',
      tiers: DEFAULT_COPILOT_CONFIDENCE_TIERS,
    }
  }

  return null
}
