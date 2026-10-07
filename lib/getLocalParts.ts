// lib/localTime.ts
// TODO: take from cities.timezone
export const CITY_TIMEZONE = 'Europe/Madrid' // later: cities.timezone

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export function getLocalParts(date: Date, timeZone = CITY_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    weekday: 'short',
  }).formatToParts(date)

  const get = (type: string) => parts.find(p => p.type === type)!.value
  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`, // '2026-09-28'
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    weekday: WEEKDAYS[get('weekday')], // 0 = Sunday, same as getDay()
  }
}