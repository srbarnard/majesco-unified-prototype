/** Makes and models a commercial auto claim usually involves; years are matched separately. */
const VEHICLE_MODELS: { make: string; model: string; from: number }[] = [
  { make: 'Ford', model: 'F-150', from: 2005 },
  { make: 'Ford', model: 'F-250', from: 2005 },
  { make: 'Ford', model: 'F-350', from: 2005 },
  { make: 'Ford', model: 'F-550', from: 2005 },
  { make: 'Ford', model: 'Transit', from: 2015 },
  { make: 'Ford', model: 'Transit Connect', from: 2010 },
  { make: 'Ford', model: 'E-350', from: 2005 },
  { make: 'Ford', model: 'Explorer', from: 2005 },
  { make: 'Ford', model: 'Escape', from: 2005 },
  { make: 'Ford', model: 'Ranger', from: 2019 },
  { make: 'Chevrolet', model: 'Silverado 1500', from: 2005 },
  { make: 'Chevrolet', model: 'Silverado 2500HD', from: 2005 },
  { make: 'Chevrolet', model: 'Silverado 3500HD', from: 2005 },
  { make: 'Chevrolet', model: 'Express 2500', from: 2005 },
  { make: 'Chevrolet', model: 'Colorado', from: 2005 },
  { make: 'Chevrolet', model: 'Tahoe', from: 2005 },
  { make: 'Chevrolet', model: 'Malibu', from: 2005 },
  { make: 'GMC', model: 'Sierra 1500', from: 2005 },
  { make: 'GMC', model: 'Sierra 2500HD', from: 2005 },
  { make: 'GMC', model: 'Savana 2500', from: 2005 },
  { make: 'Ram', model: '1500', from: 2011 },
  { make: 'Ram', model: '2500', from: 2011 },
  { make: 'Ram', model: '3500', from: 2011 },
  { make: 'Ram', model: 'ProMaster', from: 2014 },
  { make: 'Ram', model: 'ProMaster City', from: 2015 },
  { make: 'Toyota', model: 'Tacoma', from: 2005 },
  { make: 'Toyota', model: 'Tundra', from: 2005 },
  { make: 'Toyota', model: 'Camry', from: 2005 },
  { make: 'Toyota', model: 'Corolla', from: 2005 },
  { make: 'Toyota', model: 'RAV4', from: 2005 },
  { make: 'Toyota', model: 'Sienna', from: 2005 },
  { make: 'Honda', model: 'Accord', from: 2005 },
  { make: 'Honda', model: 'Civic', from: 2005 },
  { make: 'Honda', model: 'CR-V', from: 2005 },
  { make: 'Honda', model: 'Odyssey', from: 2005 },
  { make: 'Nissan', model: 'Altima', from: 2005 },
  { make: 'Nissan', model: 'Frontier', from: 2005 },
  { make: 'Nissan', model: 'NV200', from: 2013 },
  { make: 'Nissan', model: 'Rogue', from: 2008 },
  { make: 'Jeep', model: 'Grand Cherokee', from: 2005 },
  { make: 'Jeep', model: 'Wrangler', from: 2005 },
  { make: 'Mercedes-Benz', model: 'Sprinter 2500', from: 2010 },
  { make: 'Mercedes-Benz', model: 'Sprinter 3500', from: 2010 },
  { make: 'Tesla', model: 'Model 3', from: 2017 },
  { make: 'Tesla', model: 'Model Y', from: 2020 },
  { make: 'Isuzu', model: 'NPR', from: 2005 },
  { make: 'Hino', model: '268', from: 2005 },
  { make: 'Freightliner', model: 'Cascadia', from: 2008 },
  { make: 'Freightliner', model: 'M2 106', from: 2005 },
  { make: 'International', model: 'LT', from: 2017 },
  { make: 'International', model: 'MV', from: 2018 },
  { make: 'Kenworth', model: 'T680', from: 2013 },
  { make: 'Peterbilt', model: '579', from: 2013 },
  { make: 'Volvo', model: 'VNL', from: 2005 },
]

const NEWEST_MODEL_YEAR = new Date().getFullYear() + 1
const MAX_MATCHES = 8

/**
 * Year / make / model suggestions for what the user has typed. A 4-digit year pins the year;
 * every other word must start a word of the make or model ("f2" matches "F-250"). Without a year,
 * the latest model years are offered first.
 */
export function matchVehicles(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const yearWord = words.find((word) => /^(19|20)\d{2}$/.test(word))
  const year = yearWord ? Number(yearWord) : null
  const rest = words.filter((word) => word !== yearWord)
  if (year == null && rest.length === 0) return []
  const normalize = (text: string) => text.toLowerCase().replace(/-/g, '')
  const models = VEHICLE_MODELS.filter((vehicle) => {
    if (year != null && (year < vehicle.from || year > NEWEST_MODEL_YEAR)) return false
    const haystack = `${vehicle.make} ${vehicle.model}`.toLowerCase().split(/\s+/)
    return rest.every((word) =>
      haystack.some((part) => part.startsWith(word) || normalize(part).startsWith(normalize(word))),
    )
  })
  const years = year != null ? [year] : [NEWEST_MODEL_YEAR - 1, NEWEST_MODEL_YEAR - 2, NEWEST_MODEL_YEAR - 3]
  const matches: string[] = []
  for (const candidate of years) {
    for (const vehicle of models) {
      if (candidate >= vehicle.from) matches.push(`${candidate} ${vehicle.make} ${vehicle.model}`)
      if (matches.length >= MAX_MATCHES) return matches
    }
  }
  return matches
}
