export async function getWalkingRoute(
  stops: Array<{ lat: number; lng: number }>
): Promise<[number, number][]> {
  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';')
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}`
            + `?geometries=geojson&access_token=${process.env.MAPBOX_TOKEN}`

  const res  = await fetch(url)
  const data = await res.json()

  return data.routes?.[0]?.geometry?.coordinates ?? []
}
