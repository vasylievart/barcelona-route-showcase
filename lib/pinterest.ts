type PinterestEvent =
  | 'checkout'
  | 'addtocart'
  | 'pagevisit'
  | 'signup'
  | 'lead'
  | 'search'
  | 'watchvideo'
  | 'viewcategory'
  | 'custom'

interface PinterestEventData {
  event_id?:        string
  value?:           number
  order_quantity?:  number
  currency?:        string
  lead_type?:       string
  search_query?:    string
  product_category?: string
  video_title?:     string
}

export function trackPinterest(
  event: PinterestEvent,
  data?: PinterestEventData
): void {
  if (typeof window === 'undefined') return
  if (!(window as any).pintrk)       return

  ;(window as any).pintrk('track', event, {
    event_id: crypto.randomUUID(),  // unique per event — prevents duplicate counting
    ...data,
  })
}