export function mapFedExStatus(code: string): string {
  const map: Record<string, string> = {
    OC: 'pending',
    PU: 'picked_up',
    IT: 'in_transit',
    OD: 'out_for_delivery',
    DL: 'delivered',
    SE: 'exception',
    CA: 'returned',
    DE: 'exception',
  }
  return map[code] || 'in_transit'
}

export function mapDhlStatus(statusCode: string): string {
  const map: Record<string, string> = {
    'pre-registered': 'pending',
    collected: 'picked_up',
    'picked up': 'picked_up',
    picked_up: 'picked_up',
    transit: 'in_transit',
    'in transit': 'in_transit',
    delivered: 'delivered',
    failed: 'exception',
    exception: 'exception',
    returned: 'returned',
  }
  return map[statusCode.toLowerCase()] || 'in_transit'
}
