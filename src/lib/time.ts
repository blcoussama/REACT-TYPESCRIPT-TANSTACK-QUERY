/**
 * OpenWeather returns UNIX timestamps (seconds, UTC) and the city's offset
 * from UTC in seconds (`timezone` on /weather, `city.timezone` on /forecast).
 * Shifting the timestamp by that offset and formatting it in UTC gives the
 * local time *of the city*, whatever the timezone of the browser.
 */

const LOCALE = "en-US"

function toCityDate(unixSeconds: number, tzOffsetSeconds: number): Date {
  return new Date((unixSeconds + tzOffsetSeconds) * 1000)
}

function formatInCity(
  unixSeconds: number,
  tzOffsetSeconds: number,
  options: Intl.DateTimeFormatOptions
): string {
  return (
    new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: "UTC" })
      .format(toCityDate(unixSeconds, tzOffsetSeconds))
      // Recent ICU versions put a narrow no-break space before AM/PM.
      .replace(/\u202f/g, " ")
  )
}

/** "6:42 AM": sunrise, sunset. */
export function formatCityTime(unixSeconds: number, tzOffsetSeconds: number): string {
  return formatInCity(unixSeconds, tzOffsetSeconds, { hour: "numeric", minute: "2-digit" })
}

/** "6 AM": hourly chart axis. */
export function formatCityHour(unixSeconds: number, tzOffsetSeconds: number): string {
  return formatInCity(unixSeconds, tzOffsetSeconds, { hour: "numeric" })
}

/** "Fri, Oct 23": daily forecast rows. */
export function formatCityDay(unixSeconds: number, tzOffsetSeconds: number): string {
  return formatInCity(unixSeconds, tzOffsetSeconds, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

/** "2026-10-23": key used to group forecast slots by local day of the city. */
export function cityDateKey(unixSeconds: number, tzOffsetSeconds: number): string {
  return toCityDate(unixSeconds, tzOffsetSeconds).toISOString().slice(0, 10)
}
