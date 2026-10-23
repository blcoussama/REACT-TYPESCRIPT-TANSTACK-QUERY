import { lazy, Suspense } from "react"
import type { ForecastData } from "@/api/types"
import { Skeleton } from "./ui/skeleton"

// Recharts is by far the heaviest dependency: it is loaded in its own chunk,
// in parallel with the weather requests, instead of blocking the first render.
const HourlyTemperature = lazy(() => import("./HourlyTemperature"))

export function LazyHourlyTemperature({ data }: { data: ForecastData }) {
  return (
    <Suspense fallback={<Skeleton className="h-[300px] w-full flex-1 rounded-xl" />}>
      <HourlyTemperature data={data} />
    </Suspense>
  )
}
