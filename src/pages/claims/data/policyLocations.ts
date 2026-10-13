import type { ClaimPolicy } from '@/pages/claims/data/createClaimDraft'
import { getPolicyInsuredContact } from '@/pages/policies/data/mockPoliciesList'

export type InsuredLocation = { id: string; name: string; address: string }

/** Scheduled locations beyond the insured's address on file, keyed by insured name (demo data). */
const SCHEDULED: Record<string, { name: string; address: string }[]> = {
  'Atlantic Ridge Construction, LLC': [
    { name: 'Equipment yard', address: '3150 Pacific Hwy, San Diego, CA 92110' },
    { name: 'Job site · Mission Valley', address: '8800 Rio San Diego Dr, San Diego, CA 92108' },
    { name: 'Garage · Chula Vista', address: '640 Bay Blvd, Chula Vista, CA 91910' },
  ],
  'Red Oak Hospitality Group': [
    { name: 'Red Oak Inn · Midtown', address: '2100 West End Ave, Nashville, TN 37203' },
    { name: 'Red Oak Suites · Airport', address: '600 Donelson Pike, Nashville, TN 37214' },
  ],
  'Midwest Fabrication Inc.': [
    { name: 'Plant 2', address: '1800 W Lake St, Melrose Park, IL 60160' },
    { name: 'Warehouse', address: '455 E Industrial Dr, Elk Grove Village, IL 60007' },
  ],
  'Velocity Courier Services LLC': [
    { name: 'Dispatch hub', address: '2400 S Halsted St, Chicago, IL 60608' },
    { name: 'Fleet garage', address: '7100 W 59th St, Chicago, IL 60638' },
  ],
}

/** The policy's insured locations: the insured's address on file first, then any scheduled sites. */
export function insuredLocations(policy: ClaimPolicy): InsuredLocation[] {
  const contact = getPolicyInsuredContact(policy.insured)
  return [
    { name: 'Primary', address: `${contact.addressLine1}, ${contact.cityStateZip}` },
    ...(SCHEDULED[policy.insured] ?? []),
  ].map((location, index) => ({ id: `loc-${index + 1}`, ...location, name: `Loc ${index + 1} · ${location.name}` }))
}
