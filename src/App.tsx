import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import WeatherSkeleton from './components/LoadingSkeleton'
import { ThemeProvider } from './context/ThemeProvider'
import WeatherDashboard from './routes/WeatherDashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, //5mins
      gcTime: 10 * 60 * 1000, //10mins
      retry: false,
      refetchOnWindowFocus: false
    }
  }
})

// The city page is only needed after a search: separate chunk.
const CityPage = lazy(() => import('./routes/CityPage'))

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppLayout>
            <Suspense fallback={<WeatherSkeleton />}>
              <Routes>
                <Route path="/" element={<WeatherDashboard />} />
                <Route path="/city/:cityName" element={<CityPage />} />
              </Routes>
            </Suspense>
          </AppLayout>
          <Toaster richColors />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
