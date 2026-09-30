export function customerDetailsPath(customerNumber: string) {
  return `/customers/${encodeURIComponent(customerNumber)}`
}
