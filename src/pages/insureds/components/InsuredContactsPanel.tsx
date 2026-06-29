import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import type { PolicyParty } from '@/pages/policies/data/mockPolicyDetails'

type InsuredContactsPanelProps = {
  contacts: PolicyParty[]
  onClose?: () => void
}

export function InsuredContactsPanel({ contacts, onClose }: InsuredContactsPanelProps) {
  return <PartiesPanel title="Contacts" parties={contacts} onClose={onClose} />
}
