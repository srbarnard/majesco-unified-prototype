import { formatAddress, type CustomerAddress } from './createCustomerDraft'

/** Photon (OpenStreetMap) — keyless and CORS-open, so the prototype can geocode client-side. */
const PHOTON_URL = 'https://photon.komoot.io'

const US_STATES: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO',
  Connecticut: 'CT', Delaware: 'DE', 'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY',
  Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN',
  Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH',
  'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
  Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
  'Puerto Rico': 'PR',
}

type PhotonProperties = {
  countrycode?: string
  housenumber?: string
  street?: string
  name?: string
  type?: string
  city?: string
  town?: string
  village?: string
  locality?: string
  district?: string
  state?: string
  postcode?: string
}

type PhotonResponse = { features?: { properties?: PhotonProperties }[] }

type TypedQuery = { number: string | null; rest: string }

function toAddress(props: PhotonProperties, typed: TypedQuery | null): CustomerAddress | null {
  if (props.countrycode !== 'US') return null
  const streetName = props.street ?? (props.type === 'street' ? props.name : undefined)
  const city = props.city ?? props.town ?? props.village ?? props.locality ?? props.district
  if (!streetName || !city) return null
  let number = props.housenumber ?? null
  if (!number && typed?.number) {
    // Street-level hits have no house number; borrow the typed one only when the street is what they typed.
    const street = streetName.toLowerCase()
    if (!typed.rest.includes(street) && !street.startsWith(typed.rest)) return null
    number = typed.number
  }
  return {
    street: [number, streetName].filter(Boolean).join(' '),
    city,
    state: (props.state && US_STATES[props.state]) ?? props.state ?? '',
    zip: props.postcode?.split(/[;,]/)[0]?.trim() ?? '',
  }
}

function uniqueAddresses(addresses: (CustomerAddress | null)[]) {
  const seen = new Set<string>()
  return addresses.filter((address): address is CustomerAddress => {
    if (!address) return false
    const key = formatAddress(address).toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** US street addresses matching a partial line. Throws on network failure so callers can fall back to free text. */
export async function searchUsAddresses(query: string, signal?: AbortSignal): Promise<CustomerAddress[]> {
  const q = query.trim()
  if (q.length < 3) return []
  const params = new URLSearchParams({ q, limit: '10', lang: 'en', lat: '39.8', lon: '-98.6' })
  params.append('layer', 'house')
  params.append('layer', 'street')
  const response = await fetch(`${PHOTON_URL}/api/?${params}`, { signal })
  if (!response.ok) throw new Error(`Address lookup failed (${response.status})`)
  const data = (await response.json()) as PhotonResponse
  const numberMatch = q.match(/^(\d+[a-z]?)\s+(.*)$/i)
  const typed: TypedQuery = numberMatch
    ? { number: numberMatch[1]!, rest: numberMatch[2]!.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ').trim() }
    : { number: null, rest: q.toLowerCase() }
  return uniqueAddresses((data.features ?? []).map((feature) => toAddress(feature.properties ?? {}, typed))).slice(0, 6)
}

export async function reverseGeocodeUs(latitude: number, longitude: number): Promise<CustomerAddress | null> {
  const params = new URLSearchParams({ lat: String(latitude), lon: String(longitude), lang: 'en' })
  const response = await fetch(`${PHOTON_URL}/reverse?${params}`)
  if (!response.ok) return null
  const data = (await response.json()) as PhotonResponse
  return uniqueAddresses((data.features ?? []).map((feature) => toAddress(feature.properties ?? {}, null)))[0] ?? null
}

export function currentPosition(timeoutMs = 10000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation unavailable'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: timeoutMs, maximumAge: 60000 })
  })
}
