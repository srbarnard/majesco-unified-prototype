/** Stable insured id for routing — matches primary demo record and list lookups. */
export function insuredIdFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
