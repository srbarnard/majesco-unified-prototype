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

/**
 * Curated heroes — amounts and activity vary by insured type and story.
 * Commercial: higher TWP, more mid-term motion (quotes / renewals / claims).
 * Non-commercial: smaller books, lighter loss, fewer pipeline items.
 */
const SEED_INSUREDS: InsuredSeed[] = [
  {
    name: 'Atlantic Ridge Construction, LLC',
    contactName: 'Jennifer Collins',
    contactEmail: 'jennifer.collins@atlanticridge.com',
    contactPhone: '(619) 555-0142',
    addressLine1: '1240 Harbor View Blvd, Ste 400',
    cityStateZip: 'San Diego, CA 92101',
    zip: '92101',
    premiumInForce: 2_840_000,
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
    contactPhone: '(206) 555-0184',
    addressLine1: '1400 Terminal Way',
    cityStateZip: 'Seattle, WA 98134',
    zip: '98134',
    premiumInForce: 1_124_800,
    totalIncurredLoss: 186_400,
    insuredType: 'Commercial',
    upcomingRenewals: 2,
    openQuotes: 1,
    openClaims: 0,
  },
  {
    name: 'Midwest Fabrication Inc.',
    contactName: 'James Anderson',
    contactEmail: 'james.anderson@midwestfab.com',
    contactPhone: '(312) 555-0191',
    addressLine1: '2200 Fabrication Rd',
    cityStateZip: 'Rockford, IL 61109',
    zip: '61109',
    premiumInForce: 875_640,
    totalIncurredLoss: 412_800,
    insuredType: 'Commercial',
    upcomingRenewals: 1,
    openQuotes: 0,
    openClaims: 1,
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
    upcomingRenewals: 0,
    openQuotes: 0,
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
    totalIncurredLoss: 98_200,
    insuredType: 'Commercial',
    upcomingRenewals: 1,
    openQuotes: 4,
    openClaims: 0,
  },
  {
    name: 'Horizon Fleet Services, LLC',
    contactName: 'Paula Ortiz',
    contactEmail: 'paula.ortiz@horizonfleet.com',
    contactPhone: '(480) 555-0128',
    addressLine1: '3900 Desert Peak Rd',
    cityStateZip: 'Phoenix, AZ 85034',
    zip: '85034',
    premiumInForce: 1_980_600,
    totalIncurredLoss: 742_500,
    insuredType: 'Commercial',
    upcomingRenewals: 0,
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
    premiumInForce: 642_000,
    totalIncurredLoss: 28_400,
    insuredType: 'Commercial',
    upcomingRenewals: 3,
    openQuotes: 0,
    openClaims: 0,
  },
  {
    name: 'Northshore Medical Group, P.C.',
    contactName: 'Marcus Lee',
    contactEmail: 'marcus.lee@northshoremed.com',
    contactPhone: '(847) 555-0133',
    addressLine1: '2100 Medical Center Dr',
    cityStateZip: 'Evanston, IL 60201',
    zip: '60201',
    premiumInForce: 318_400,
    totalIncurredLoss: 64_800,
    insuredType: 'Non-commercial',
    upcomingRenewals: 1,
    openQuotes: 1,
    openClaims: 0,
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
    openClaims: 0,
  },
  {
    name: 'Red Oak Hospitality Group',
    contactName: 'Jordan Ellis',
    contactEmail: 'jordan.ellis@redoakhospitality.com',
    contactPhone: '(615) 555-0121',
    addressLine1: '500 Red Oak Blvd',
    cityStateZip: 'Nashville, TN 37203',
    zip: '37203',
    premiumInForce: 1_420_250,
    totalIncurredLoss: 876_500,
    insuredType: 'Commercial',
    upcomingRenewals: 2,
    openQuotes: 0,
    openClaims: 2,
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
    upcomingRenewals: 0,
    openQuotes: 0,
    openClaims: 0,
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
    premiumInForce: 164_800,
    totalIncurredLoss: 12_400,
    insuredType: 'Non-commercial',
    upcomingRenewals: 0,
    openQuotes: 1,
    openClaims: 0,
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
    openClaims: 0,
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
    openQuotes: 0,
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
  {
    name: 'Meadowbrook Family Practice P.C.',
    contactName: 'Helen Park',
    contactEmail: 'helen.park@meadowbrookfp.com',
    contactPhone: '(919) 555-0177',
    addressLine1: '410 Clinic Way',
    cityStateZip: 'Durham, NC 27701',
    zip: '27701',
    premiumInForce: 142_600,
    totalIncurredLoss: 8_200,
    insuredType: 'Non-commercial',
    upcomingRenewals: 1,
    openQuotes: 0,
    openClaims: 0,
  },
  {
    name: 'Harbor Light Nonprofit Alliance',
    contactName: 'Sam Rivera',
    contactEmail: 'sam.rivera@harborlight.org',
    contactPhone: '(617) 555-0155',
    addressLine1: '88 Pier Ave',
    cityStateZip: 'Boston, MA 02210',
    zip: '02210',
    premiumInForce: 96_400,
    totalIncurredLoss: 22_100,
    insuredType: 'Non-commercial',
    upcomingRenewals: 0,
    openQuotes: 0,
    openClaims: 1,
  },
  {
    name: 'Clearwater Mutual Insurance Club',
    contactName: 'Diane Foster',
    contactEmail: 'diane.foster@clearwatermutual.org',
    contactPhone: '(813) 555-0148',
    addressLine1: '250 Mutual Ln',
    cityStateZip: 'Tampa, FL 33602',
    zip: '33602',
    premiumInForce: 208_900,
    totalIncurredLoss: 41_600,
    insuredType: 'Non-commercial',
    upcomingRenewals: 2,
    openQuotes: 1,
    openClaims: 0,
  },
]

const ADDITIONAL_NAMES = [
  'Monarch Office Solutions LLC',
  'Velocity Courier Services LLC',
  'Tri-State Warehousing Co.',
  'Cornerstone Property Developers',
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
  'Highland Youth Athletics Assoc.',
  'Sunrise Community Housing Trust',
  'Riverside Parish Properties',
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

function isNonCommercialName(name: string) {
  return /clinic|dental|parish|school|nonprofit|volunteer|civic|housing trust|mutual|athletics|medical specialists|senior care|family practice/i.test(
    name,
  )
}

/** Commercial books: larger TWP, more pipeline / claim motion. */
function commercialAmounts(index: number) {
  const premiumInForce = 480_000 + ((index * 97_400) % 2_650_000)
  const lossRatioBand = index % 5
  const totalIncurredLoss =
    lossRatioBand === 0
      ? Math.round(premiumInForce * 0.08)
      : lossRatioBand === 1
        ? Math.round(premiumInForce * 0.22)
        : lossRatioBand === 2
          ? Math.round(premiumInForce * 0.41)
          : lossRatioBand === 3
            ? Math.round(premiumInForce * 0.58)
            : Math.round(premiumInForce * 0.74)

  return {
    premiumInForce,
    totalIncurredLoss,
    upcomingRenewals: index % 3 === 0 ? (index % 3) + 1 : index % 4 === 0 ? 1 : null,
    openQuotes: index % 2 === 0 ? (index % 4) + 1 : index % 5 === 0 ? 1 : null,
    openClaims: index % 3 === 0 ? (index % 3) + 1 : index % 7 === 0 ? 1 : null,
  }
}

/** Non-commercial books: smaller TWP, quieter pipeline, lighter loss. */
function nonCommercialAmounts(index: number) {
  const premiumInForce = 72_000 + ((index * 18_600) % 280_000)
  const lossRatioBand = index % 4
  const totalIncurredLoss =
    lossRatioBand === 0
      ? Math.round(premiumInForce * 0.04)
      : lossRatioBand === 1
        ? Math.round(premiumInForce * 0.11)
        : lossRatioBand === 2
          ? Math.round(premiumInForce * 0.19)
          : Math.round(premiumInForce * 0.28)

  return {
    premiumInForce,
    totalIncurredLoss,
    upcomingRenewals: index % 4 === 0 ? 1 : index % 6 === 0 ? 2 : null,
    openQuotes: index % 5 === 0 ? 1 : null,
    openClaims: index % 6 === 0 ? 1 : null,
  }
}

function buildGeneratedInsured(name: string, index: number): InsuredSeed {
  const location = LOCATIONS[index % LOCATIONS.length]
  const first = CONTACT_FIRST[index % CONTACT_FIRST.length]
  const last = CONTACT_LAST[(index * 3) % CONTACT_LAST.length]
  const domain =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 18) || 'insured'
  const nonCommercial = isNonCommercialName(name)
  const amounts = nonCommercial ? nonCommercialAmounts(index) : commercialAmounts(index)

  return {
    name,
    contactName: `${first} ${last}`,
    contactEmail: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}.com`,
    contactPhone: `(${200 + (index % 700)}) 555-${String(1000 + (index % 9000)).slice(-4)}`,
    addressLine1: location.addressLine1,
    cityStateZip: location.cityStateZip,
    zip: location.zip,
    insuredType: nonCommercial ? 'Non-commercial' : 'Commercial',
    premiumInForce: amounts.premiumInForce,
    totalIncurredLoss: amounts.totalIncurredLoss,
    upcomingRenewals: amounts.upcomingRenewals,
    openQuotes: amounts.openQuotes,
    openClaims: amounts.openClaims,
  }
}

function normalizeCount(value: number | null | undefined): number | null {
  if (value == null || value <= 0) return null
  return value
}

function buildInsureds(): InsuredListRecord[] {
  const seedNames = new Set(SEED_INSUREDS.map((row) => row.name))
  const generated = ADDITIONAL_NAMES.filter((name) => !seedNames.has(name)).map((name, index) =>
    buildGeneratedInsured(name, index + SEED_INSUREDS.length),
  )

  return [...SEED_INSUREDS, ...generated].slice(0, 75).map((row, index) => ({
    id: `ins-${String(index + 1).padStart(3, '0')}`,
    ...row,
    upcomingRenewals: normalizeCount(row.upcomingRenewals),
    openQuotes: normalizeCount(row.openQuotes),
    openClaims: normalizeCount(row.openClaims),
  }))
}

export const insuredsMock: InsuredListRecord[] = buildInsureds()

export const INSUREDS_TOTAL_ROWS = insuredsMock.length

const commercialCount = insuredsMock.filter((row) => row.insuredType === 'Commercial').length
const nonCommercialCount = insuredsMock.filter((row) => row.insuredType === 'Non-commercial').length
const renewalsCount = insuredsMock.filter((row) => (row.upcomingRenewals ?? 0) > 0).length
const quotesCount = insuredsMock.filter((row) => (row.openQuotes ?? 0) > 0).length
const claimsCount = insuredsMock.filter((row) => (row.openClaims ?? 0) > 0).length

export const insuredsWorkspaceSummary = `You are viewing **${INSUREDS_TOTAL_ROWS} insured accounts** — **${commercialCount} commercial** and **${nonCommercialCount} non-commercial**. **${renewalsCount} have upcoming renewals**, **${quotesCount} have open quotes**, and **${claimsCount} have open claims**.`

export const insuredsWorkspaceInsights = [
  'Atlantic Ridge Construction leads commercial TWP at $2.84M with renewal activity in the next 90 days',
  `Commercial accounts carry most pipeline volume — ${quotesCount} insureds have open quotes needing follow-up`,
  'Non-commercial books run smaller premium with lighter incurred loss; watch Harbor Light for open claim activity',
]

export const insuredsNextSteps = [
  'Review Atlantic Ridge Construction ahead of the upcoming renewal',
  'Follow up on commercial insureds with open quotes and no recent producer action',
  'Check open claims on Red Oak Hospitality and Granite State Builders',
]

export const insuredsListQuickActions = ['Recent activity', 'Upcoming renewals', 'Insureds with open quotes']
