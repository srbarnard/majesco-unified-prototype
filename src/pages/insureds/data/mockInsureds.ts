export type InsuredType = 'Commercial' | 'Non-commercial'

export type InsuredListRecord = {
  id: string
  name: string
  contactName: string
  contactEmail: string
  contactPhone: string
  addressLine1: string
  cityStateZip: string
  zip: string
  premiumInForce: number
  totalIncurredLoss: number
  insuredType: InsuredType
  upcomingRenewals: number | null
  openQuotes: number | null
  openClaims: number | null
}

type InsuredSeed = Omit<InsuredListRecord, 'id'>

const CONTACT_FIRST = [
  'Jennifer',
  'Michael',
  'Alicia',
  'Derek',
  'Paula',
  'Nina',
  'Marcus',
  'Samantha',
  'Jordan',
  'Morgan',
  'Elena',
  'Chris',
  'Rita',
  'Tom',
  'Brenda',
]
const CONTACT_LAST = [
  'Collins',
  'Rodriguez',
  'Chen',
  'Walsh',
  'Ortiz',
  'Patel',
  'Lee',
  'Brooks',
  'Ellis',
  'Vasquez',
  'Reynolds',
  'Gomez',
  'Alvarez',
  'Holmes',
  'Nguyen',
]

const SEED_INSUREDS: InsuredSeed[] = [
  {
    name: 'Atlantic Ridge Construction, LLC',
    contactName: 'Jennifer Collins',
    contactEmail: 'jennifer.collins@atlanticridge.com',
    contactPhone: '(619) 555-0142',
    addressLine1: '1240 Harbor View Blvd, Ste 400',
    cityStateZip: 'San Diego, CA 92101',
    zip: '92101',
    premiumInForce: 1_180_450,
    totalIncurredLoss: 1_245_320,
    insuredType: 'Commercial',
    upcomingRenewals: 1,
    openQuotes: 2,
    openClaims: 1,
  },
  {
    name: 'Blue Harbor Logistics Inc.',
    contactName: 'Michael Rodriguez',
    contactEmail: 'michael.rodriguez@blueharbor.com',
    contactPhone: '(512) 555-0184',
    addressLine1: '300 Demo Way, Floor 3',
    cityStateZip: 'Austin, TX 78701',
    zip: '78701',
    premiumInForce: 842_300,
    totalIncurredLoss: 875_640,
    insuredType: 'Commercial',
    upcomingRenewals: 2,
    openQuotes: 1,
    openClaims: 2,
  },
  {
    name: 'Maple Grove Property Management',
    contactName: 'Alicia Chen',
    contactEmail: 'alicia.chen@maplegrove.com',
    contactPhone: '(612) 555-0188',
    addressLine1: '880 Maple Grove Ave',
    cityStateZip: 'Minneapolis, MN 55401',
    zip: '55401',
    premiumInForce: 2_310_980,
    totalIncurredLoss: 456_210,
    insuredType: 'Commercial',
    upcomingRenewals: null,
    openQuotes: null,
    openClaims: 1,
  },
  {
    name: 'Keystone Commercial Realty',
    contactName: 'Derek Walsh',
    contactEmail: 'derek.walsh@keystonecommercial.com',
    contactPhone: '(215) 555-0160',
    addressLine1: '1600 Market St, Floor 12',
    cityStateZip: 'Philadelphia, PA 19103',
    zip: '19103',
    premiumInForce: 1_560_000,
    totalIncurredLoss: 312_400,
    insuredType: 'Commercial',
    upcomingRenewals: 1,
    openQuotes: 4,
    openClaims: null,
  },
  {
    name: 'Horizon Fleet Services, LLC',
    contactName: 'Paula Ortiz',
    contactEmail: 'paula.ortiz@horizonfleet.com',
    contactPhone: '(480) 555-0128',
    addressLine1: '3900 Desert Peak Rd',
    cityStateZip: 'Phoenix, AZ 85034',
    zip: '85034',
    premiumInForce: 978_600,
    totalIncurredLoss: 421_900,
    insuredType: 'Commercial',
    upcomingRenewals: null,
    openQuotes: 1,
    openClaims: 1,
  },
  {
    name: 'Silverline Manufacturing Co.',
    contactName: 'Nina Patel',
    contactEmail: 'nina.patel@silverlinemfg.com',
    contactPhone: '(513) 555-0190',
    addressLine1: '4500 Industrial Pkwy',
    cityStateZip: 'Cincinnati, OH 45241',
    zip: '45241',
    premiumInForce: 1_245_000,
    totalIncurredLoss: 890_250,
    insuredType: 'Commercial',
    upcomingRenewals: 3,
    openQuotes: 1,
    openClaims: null,
  },
  {
    name: 'Northshore Medical Group, P.C.',
    contactName: 'Marcus Lee',
    contactEmail: 'marcus.lee@northshoremed.com',
    contactPhone: '(847) 555-0133',
    addressLine1: '2100 Medical Center Dr',
    cityStateZip: 'Evanston, IL 60201',
    zip: '60201',
    premiumInForce: 734_800,
    totalIncurredLoss: 145_200,
    insuredType: 'Non-commercial',
    upcomingRenewals: null,
    openQuotes: null,
    openClaims: 2,
  },
  {
    name: 'Summit Outdoor Equipment, Inc.',
    contactName: 'Samantha Brooks',
    contactEmail: 'samantha.brooks@summitoutdoor.com',
    contactPhone: '(303) 555-0174',
    addressLine1: '77 Summit Trail',
    cityStateZip: 'Denver, CO 80202',
    zip: '80202',
    premiumInForce: 612_400,
    totalIncurredLoss: 88_400,
    insuredType: 'Commercial',
    upcomingRenewals: 1,
    openQuotes: 2,
    openClaims: null,
  },
  {
    name: 'Red Oak Hospitality Group',
    contactName: 'Jordan Ellis',
    contactEmail: 'jordan.ellis@redoakhospitality.com',
    contactPhone: '(615) 555-0121',
    addressLine1: '500 Red Oak Blvd',
    cityStateZip: 'Nashville, TN 37203',
    zip: '37203',
    premiumInForce: 890_250,
    totalIncurredLoss: 276_500,
    insuredType: 'Commercial',
    upcomingRenewals: 2,
    openQuotes: null,
    openClaims: 1,
  },
  {
    name: 'Evergreen Food Distributors',
    contactName: 'Morgan Chen',
    contactEmail: 'morgan.chen@evergreenfoods.com',
    contactPhone: '(206) 555-0141',
    addressLine1: '7800 Harbor Ave SW',
    cityStateZip: 'Seattle, WA 98106',
    zip: '98106',
    premiumInForce: 421_900,
    totalIncurredLoss: 54_300,
    insuredType: 'Commercial',
    upcomingRenewals: null,
    openQuotes: null,
    openClaims: null,
  },
  {
    name: 'Cascade Mechanical Contractors Inc.',
    contactName: 'Elena Vasquez',
    contactEmail: 'elena.vasquez@cascademech.com',
    contactPhone: '(503) 555-0119',
    addressLine1: '880 SW 5th Ave',
    cityStateZip: 'Portland, OR 97204',
    zip: '97204',
    premiumInForce: 1_110_000,
    totalIncurredLoss: 640_200,
    insuredType: 'Commercial',
    upcomingRenewals: 1,
    openQuotes: 1,
    openClaims: 2,
  },
  {
    name: 'Brightline Dental Associates P.C.',
    contactName: 'Chris Reynolds',
    contactEmail: 'chris.reynolds@brightlinedental.com',
    contactPhone: '(305) 555-0166',
    addressLine1: '900 Ocean Dr, Ste 12',
    cityStateZip: 'Miami Beach, FL 33139',
    zip: '33139',
    premiumInForce: 286_500,
    totalIncurredLoss: 12_400,
    insuredType: 'Non-commercial',
    upcomingRenewals: null,
    openQuotes: 1,
    openClaims: null,
  },
  {
    name: 'Prairie Wind Energy Services',
    contactName: 'Rita Gomez',
    contactEmail: 'rita.gomez@prairiewind.com',
    contactPhone: '(402) 555-0167',
    addressLine1: '900 Elevator Rd',
    cityStateZip: 'Omaha, NE 68102',
    zip: '68102',
    premiumInForce: 1_890_000,
    totalIncurredLoss: 210_800,
    insuredType: 'Commercial',
    upcomingRenewals: 1,
    openQuotes: 2,
    openClaims: null,
  },
  {
    name: 'Lakeside Restaurant Group LLC',
    contactName: 'Tom Alvarez',
    contactEmail: 'tom.alvarez@lakesiderestaurants.com',
    contactPhone: '(312) 555-0188',
    addressLine1: '2200 Cold Storage Pkwy',
    cityStateZip: 'Chicago, IL 60614',
    zip: '60614',
    premiumInForce: 534_800,
    totalIncurredLoss: 198_600,
    insuredType: 'Commercial',
    upcomingRenewals: 2,
    openQuotes: null,
    openClaims: 1,
  },
  {
    name: 'Granite State Builders Corp.',
    contactName: 'Brenda Holmes',
    contactEmail: 'brenda.holmes@granitestatebuilders.com',
    contactPhone: '(603) 555-0144',
    addressLine1: '45 Rockefeller Plaza',
    cityStateZip: 'New York, NY 10111',
    zip: '10111',
    premiumInForce: 2_110_000,
    totalIncurredLoss: 978_600,
    insuredType: 'Commercial',
    upcomingRenewals: 1,
    openQuotes: 3,
    openClaims: 2,
  },
]

const ADDITIONAL_NAMES = [
  'Monarch Office Solutions LLC',
  'Velocity Courier Services LLC',
  'Tri-State Warehousing Co.',
  'Cornerstone Property Developers',
  'Midwest Fabrication Inc.',
  'Sunbelt Roofing & Exteriors LLC',
  'Greenfield Organic Markets Inc.',
  'Apex Technology Consulting Group',
  'River City Healthcare Staffing',
  'Coastal Marine Services Inc.',
  'Sterling Auto Parts Distributors',
  'Pinnacle Event Productions LLC',
  'Willow Creek Senior Living LLC',
  'Harbor View Hospitality Group',
  'Pinnacle Food Distributors Inc.',
  'NorthBridge Commercial Realty',
  'GreenLine Hospitality Group',
  'Keystone Benefits Partners',
  'Pacific Coast Aggregates Inc.',
  'Ironwood Manufacturing LLC',
  'Summit Logistics LLC',
  'Midwest Grain Cooperative',
  'Evergreen Civic Partners',
  'Redwood Ridge Construction LLC',
  'Atlas Freight Solutions Inc.',
  'Harborview Property Management',
  'Keystone Manufacturing Co.',
  'Northshore Clinics Association',
  'Blue Ridge Insurance Services',
  'First Coastal Agency Group',
  'Canyon Ridge Utilities Inc.',
  'Lakeshore Packaging Co.',
  'Oakmont Facilities Management',
  'Sierra Peak Transportation LLC',
  'Valley Forge Industrial Supply',
  'Bayview Senior Care Network',
  'Cedar Hill Farm Cooperative',
  'Metro Transit Contractors Inc.',
  'Pinecrest Lodging Partners',
  'Southland Beverage Distributors',
  'Westfield Precision Machining',
  'Northern Lights Energy Co.',
  'Capitol Hill Property Trust',
  'Gulfstream Marine Repair LLC',
  'Heartland Agricultural Services',
  'Ridgeway Medical Specialists',
  'Stonebridge Home Builders Inc.',
  'Urban Canopy Landscaping Co.',
  'Frontier Pipeline Services',
  'Lumen Office Interiors LLC',
  'Clearwater Mutual Insurance Club',
  'Highland Youth Athletics Assoc.',
  'Sunrise Community Housing Trust',
  'Riverside Parish Properties',
  'Meadowbrook Family Practice P.C.',
  'Harbor Light Nonprofit Alliance',
  'West End Cooperative Markets',
  'Prairie School District Trust',
  'Lakeshore Civic Theater Group',
  'Mountain View Volunteer Fire Dist.',
]

const LOCATIONS: Array<{ addressLine1: string; cityStateZip: string; zip: string }> = [
  { addressLine1: '110 N Carpenter St', cityStateZip: 'Chicago, IL 60607', zip: '60607' },
  { addressLine1: '4800 Freightway Blvd', cityStateZip: 'Dallas, TX 75261', zip: '75261' },
  { addressLine1: '1250 Harbor Island Dr', cityStateZip: 'San Diego, CA 92101', zip: '92101' },
  { addressLine1: '1600 Market St', cityStateZip: 'Philadelphia, PA 19103', zip: '19103' },
  { addressLine1: '400 Imaginary Ave, Ste 400', cityStateZip: 'San Francisco, CA 94105', zip: '94105' },
  { addressLine1: '3900 Desert Peak Rd', cityStateZip: 'Phoenix, AZ 85034', zip: '85034' },
  { addressLine1: '7800 Harbor Ave SW', cityStateZip: 'Seattle, WA 98101', zip: '98101' },
  { addressLine1: '4500 Industrial Pkwy', cityStateZip: 'Cincinnati, OH 45241', zip: '45241' },
  { addressLine1: '77 Summit Trail', cityStateZip: 'Denver, CO 80202', zip: '80202' },
  { addressLine1: '2100 Medical Center Dr', cityStateZip: 'Evanston, IL 60614', zip: '60614' },
  { addressLine1: '900 Ocean Dr', cityStateZip: 'Miami Beach, FL 33139', zip: '33139' },
  { addressLine1: '500 Red Oak Blvd', cityStateZip: 'Nashville, TN 37203', zip: '37203' },
]

function optionalCount(index: number, every: number, max: number): number | null {
  if (index % every !== 0) return null
  const value = (index % max) + 1
  return value
}

function buildGeneratedInsured(name: string, index: number): InsuredSeed {
  const location = LOCATIONS[index % LOCATIONS.length]
  const first = CONTACT_FIRST[index % CONTACT_FIRST.length]
  const last = CONTACT_LAST[(index * 3) % CONTACT_LAST.length]
  const domain = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18) || 'insured'
  const nonCommercial = /clinic|dental|parish|school|nonprofit|volunteer|civic|housing trust|mutual|athletics/i.test(
    name,
  )

  return {
    name,
    contactName: `${first} ${last}`,
    contactEmail: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}.com`,
    contactPhone: `(${200 + (index % 700)}) 555-${String(1000 + (index % 9000)).slice(-4)}`,
    addressLine1: location.addressLine1,
    cityStateZip: location.cityStateZip,
    zip: location.zip,
    premiumInForce: 145_200 + ((index * 37_850) % 2_400_000),
    totalIncurredLoss: (index * 41_250) % 1_500_000,
    insuredType: nonCommercial ? 'Non-commercial' : 'Commercial',
    upcomingRenewals: optionalCount(index, 3, 3),
    openQuotes: optionalCount(index, 4, 4),
    openClaims: optionalCount(index, 5, 3),
  }
}

function buildInsureds(): InsuredListRecord[] {
  const generated = ADDITIONAL_NAMES.map((name, index) => buildGeneratedInsured(name, index + SEED_INSUREDS.length))
  return [...SEED_INSUREDS, ...generated].slice(0, 75).map((row, index) => ({
    id: `ins-${String(index + 1).padStart(3, '0')}`,
    ...row,
  }))
}

export const insuredsMock: InsuredListRecord[] = buildInsureds()

export const INSUREDS_TOTAL_ROWS = insuredsMock.length

export const insuredsWorkspaceSummary =
  'You are viewing **75 insured accounts** across commercial and non-commercial books. **18 have upcoming renewals**, **14 have open quotes**, and **11 have open claims**.'

export const insuredsWorkspaceInsights = [
  'Atlantic Ridge Construction leads incurred loss at $1.25M with a renewal in the next 90 days',
  '14 insureds have open quotes that still need producer follow-up',
  'Non-commercial accounts are lighter on premium but carry more open claims per account',
]

export const insuredsNextSteps = [
  'Review Atlantic Ridge Construction ahead of the upcoming renewal',
  'Follow up on insureds with open quotes and no assigned producer action',
  'Check open claims on Northshore Medical Group and Granite State Builders',
]

export const insuredsListQuickActions = ['Recent activity', 'Upcoming renewals', 'Insureds with open quotes']
