import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AppLayout from './components/AppLayout'
import { ThemeProvider } from './context/ThemeProvider'
import WeatherDashboard from './routes/WeatherDashboard'
import { CityPage } from './routes/CityPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'

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

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppLayout>
            <Routes>
              <Route path="/" element={ <WeatherDashboard /> } />
              <Route path="/city/:cityName" element={ <CityPage /> } />
            </Routes>
          </AppLayout>
          <Toaster richColors />
        </ThemeProvider>
      </BrowserRouter>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
    
  )
}

export default App
